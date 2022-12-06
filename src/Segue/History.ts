import { Application } from '../Application'
import { SegueBase } from './Base'
import { PopState, PresetConfig, SegueBackType } from '../types'

class SegueHistory extends SegueBase {
  public prevHistoryStep: 0 | 1 | -1 = 0
  public historyIndex = history.length
  public historyShadowLength = history.length
  public oneHistoryIndex = 0
  public historyDirection = 0
  public backFromType: SegueBackType
  private backoutCount = 0
  private sessionHistory: PopState[] = []
  private silentObserver: number | undefined = undefined
  private defaultURLPath = location.pathname
  private defaultURLSearch = location.search
  private historyBreakCallback: (() => void) | null = null
  constructor(app: Application, presetConfig: PresetConfig) {
    super(app, presetConfig)
    this.bindHistoryState()
  }
  public get fromHistoryForward(): boolean {
    return this.prevHistoryStep === -1 && this.historyDirection === 1
  }
  public get fromHistoryBack(): boolean {
    return this.prevHistoryStep === -1 && this.historyDirection === -1
  }
  public get historyState(): PopState {
    return document.readyState === 'loading' ? this.sessionHistory[this.oneHistoryIndex] : history.state
  }
  get isOverscrollHistoryNavigation(): boolean {
    if (!this.fromHistoryBack && !this.fromHistoryForward) return false
    const oSHN = this.application.overscrollHistoryNavigation
    const isWipe = oSHN.type.indexOf('wipe') !== -1
    const delayTime = isWipe ? 300 : 200
    if (Date.now() - oSHN.moment > delayTime) return false
    return true
  }
  private bindHistoryState(): void {
    addEventListener('popstate', (event: PopStateEvent) => {
      this.popstate(event.state)
    }, false)
    addEventListener('hashchange', () => {
      this.observeSilent()
    }, false)
  }
  public observeSilent(times = 10): void {
    if (this.options.oneHistory) return
    if (document.readyState === 'loading') times = 30
    clearTimeout(this.silentObserver)
    if (!times) return
    this.silentObserver = setTimeout(async () => {
      const route = this.historyState || history.state || this.application.route
      const id = decodeURIComponent(route.id)
      if (id && decodeURIComponent(id) !== this.id) {
        await this.popstate(this.historyState).catch(() => {
          clearTimeout(this.silentObserver)
        })
      }
      this.observeSilent(times--)
    }, 2000) as unknown as number
  }
  public async popstate(state: PopState): Promise<void> {
    const { historyIndex = this.historyShadowLength } = state ?? {}
    if (historyIndex === this.historyIndex) {
      this.historyDirection = 0
    } else if (historyIndex > this.historyIndex) {
      this.historyDirection = 1
    } else {
      this.historyDirection = -1
    }
    // back state when first hash change
    if (state === null) {
      this.historyDirection = -1
      this.historyIndex = this.historyIndex - 1
    } else {
      this.historyIndex = historyIndex
    }
    await this.toHistory(state)
    this.observeSilent(20)
  }
  public async back(type?: SegueBackType): Promise<void> {
    this.backFromType = type
    return this.backTo().catch(() => {
      this.backFromType = undefined
    })
  }
  public backTo(): Promise<void> {
    if (!this.options.oneHistory) {
      history.back()
      this.observeSilent(20)
      return Promise.resolve()
    }
    const state = this.sessionHistory[this.oneHistoryIndex - 1]
    if (!state) return Promise.reject()
    this.historyDirection = -1
    this.oneHistoryIndex = this.oneHistoryIndex - 1
    return this.toHistory(state)
  }
  public forward(): Promise<void> {
    if (!this.options.oneHistory) {
      history.forward()
      this.observeSilent(20)
      return Promise.resolve()
    }
    const state = this.sessionHistory[this.oneHistoryIndex + 1]
    if (!state) return Promise.reject()
    this.historyDirection = 1
    this.oneHistoryIndex = this.oneHistoryIndex + 1
    return this.toHistory(state)
  }
  public getSearch(search = ''): string {
    const resolve = new URL(search, location.origin + this.defaultURLPath + this.defaultURLSearch)
    return resolve.pathname + resolve.search
  }
  public pushState(id = '', title = '', search = ''): void {
    id = encodeURIComponent(id)
    search = this.getSearch(search)
    const length = this.historyShadowLength
    const state: PopState = {
      id,
      title,
      time: Date.now(),
      search,
      historyIndex: length
    }
    this.observeSilent(20)
    if (this.sessionHistory.length !== 0) {
      this.sessionHistory.length = this.oneHistoryIndex + 1
    }
    this.sessionHistory.push(state)
    this.oneHistoryIndex = this.sessionHistory.length - 1
    if (this.options.oneHistory) {
      return this.replaceState(id, title, search)
    }
    history.pushState(state, title, search + '#' + id)
    this.historyIndex = this.historyShadowLength = length + 1
    this.historyDirection = 1
  }
  public replaceState(id = '', title = '', search = ''): void {
    id = encodeURIComponent(id)
    search = this.getSearch(search)
    const length = this.historyShadowLength
    const state: PopState = {
      id,
      title,
      time: Date.now(),
      search,
      historyIndex: length
    }
    history.replaceState(state, title, search + '#' + id)
    this.historyIndex = length
    this.historyDirection = 0
  }
  public requestRegisterHistory(id = '', title = '', search = ''): void {
    if (this.applet.viewType === 'portal') return
    if (this.options.oneHistory) {
      if (this.prevHistoryStep === -1) {
        return this.replaceState(id, title, search)
      }
    } else if (this.prevHistoryStep === -1) {
      return this.replaceState(id, title, search)
    }
    // No state changes are made to those returned from history
    if (this.fromHistoryBack || this.fromHistoryForward) return
    this.pushState(id, title, search)
  }
  public async toHistory(state?: PopState): Promise<void> {
    const options = this.options
    const route = state || history.state || this.application.route
    const id = decodeURIComponent(route.id) || options.index || 'frameworks'
    const search = route.search
    const applet = await this.application.get(id)
    if (!applet) return
    if (this.checkSingleLock()) {
      this.backoutCount++
      if (this.options.holdBack?.(this.backoutCount) === true) {
        this.pushState(id, applet.config.title, search)
        this.application.trigger('exit', {
          backoutCount: this.backoutCount
        })
      }
      return
    } else {
      this.backoutCount = 0
    }

    const inLevel = applet.config.level ?? 0
    const outLever = this.applet.config.level ?? 0
    if (options.singleFlow && inLevel !== 0 && inLevel >= outLever) {
      return this.back()
    }
    if (this.isOverscrollHistoryNavigation) {
      this.historyBreakCallback?.()
    }
    this.application.segue.to(id, search, -1).then(() => {
      this.backFromType = undefined
    })
    this.application.trigger('back', applet)
    return Promise.resolve()
  }
  public checkSingleLock(): boolean {
    return this.options.singleLock && this.applet.config.level === 0 && this.historyDirection === -1 ? true : false
  }
  public bindHistoryBreak(callback: () => void) {
    this.historyBreakCallback = callback
  }
}

export {
  SegueHistory
}
