import { AppletBase } from './Base'
import { Applet, AppletStatus, SegueActionOrigin } from '../types'

class AppletState extends AppletBase {
  public visibility = false
  public transforming = false
  public segueActionOrigin?: SegueActionOrigin
  public viewLevel = 0
  public status: AppletStatus = {
    preload: false,
    prefetch: false,
    prerender: false,
    refreshing: false,
    requestRefresh: false,
    presetElements: false
  }
  get swipeModel(): boolean {
    return this.application.config.swipeModel ?? "ontouchend" in document ? true : false
  }
  get sameOrigin(): boolean {
    if (!this.uri) {
      if (this.config.sandbox === undefined) return true
      if (this.config.sandbox.includes('allow-same-origin')) return true
      return false
    }
    const link = new URL(
      this.uri,
      window.location.toString()
    )
    const isSameOrigin = link.host === location.host
    return isSameOrigin
  }
  get level(): number {
    return this.config.level ?? 0
  }
  public setLevel(index: number) {
    this.viewLevel = index
  }
  get rel(): 'system' | 'frameworks' | 'applet' {
    if (this.id === 'system') return 'system'
    if (this.id === 'frameworks') return 'frameworks'
    return 'applet'
  }
  get uri(): string {
    return this.config?.source?.src || ''
  }
  get source(): string | Promise<string> {
    const html = this.config?.source?.html || ''
    return typeof html === 'string' ? html : html()
  }
  get hasSource(): boolean {
    return (this.uri || this.config?.source?.html) ? true : false
  }
  get noSource(): boolean {
    return !this.hasSource && !this.config.render
  }
  get viewType(): 'portal' | 'iframe' | 'shadow' {
    if (this.rel !== 'applet') return 'shadow'
    if (this.hasSource) {
      if (this.config?.portal && this.sameOrigin) {
        return 'portal'
      }
      return 'iframe'
    }
    return 'shadow'
  }
  get color(): string {
    if (this.rel !== 'applet') return 'transparent'
    const application = this.application
    const isDarkModel = application.properties.darkTheme
    const color = `${this.config.color || (isDarkModel ? '#000' : '#fff')}`
    const inherit = this.id !== 'frameworks' && color === 'inherit'
    return inherit ? (application.applets.frameworks.config.color || color) : color
  }
  get expired(): boolean {
    if (!this.view) return false
    if (this.application.prevActivityApplet?.config.modality) {
      return false
    }
    if (this.status.requestRefresh || Date.now() - this.createTime >= (this.config.timeout ?? 60000000)) {
      return true
    }
    return false
  }
  get isModality(): boolean {
    return !!this.config.modality
  }
  get isFullscreen(): boolean {
    return !this.isModality
  }
  get isPresetAppletsView(): boolean {
    return this.application.checkIsPresetAppletsView(this.id)
  }
  get useControls(): boolean {
    return this.config.disableSwipeModel !== true && this.swipeModel && this.rel === 'applet' && this.isFullscreen
  }
  get noShadowDom(): boolean {
    if (this.viewType === 'shadow') {
      if (this.config.noShadowDom) {
        return true
      }
      return false
    }
    return false
  }
  get mirroringString(): string {
    try {
      return localStorage.getItem('__MODULE_IMG__' + this.id) || ''
    } catch (error) {
      return ''
    }
  }
  get contentWindow(): Window {
    return this.sandbox?.window?.window ?? window
  }
  get contentDocument(): HTMLElement | Document | undefined {
    if (!this.sameOrigin) return
    return this.viewType === 'shadow' ? this.viewport : this.sandbox?.document
  }
  get mirroringHTML(): string {
    if (this.viewType === 'shadow') {
      return this.view?.outerHTML ?? ''
    }
    if (!this.sameOrigin) return ''
    const sandbox = this.sandbox?.sandbox as HTMLIFrameElement
    const blockTags = ['script', 'template']
    try {
      const contentDocument = sandbox.contentDocument
      if (!contentDocument) return ''
      const allElements = contentDocument.querySelectorAll('*')
      const allElementsList: Array<string> = []
      allElements.forEach((element) => {
        const tagName = element.tagName
        if (blockTags.includes(tagName)) return
        if (tagName.indexOf('-') !== -1) {
          (element as HTMLElement).style.visibility = 'hidden'
        }
        allElementsList.push(element.outerHTML)
      })
      return allElementsList.join('\n')
    } catch (error) {
      return ''
    }
  }
  get subApplet(): Applet | undefined {
    if (this.slide) {
      return this.application.applets[this.slide.activeId]
    }
    return
  }
  protected resume() {
    this.status = {
      preload: false,
      prefetch: false,
      prerender: false,
      refreshing: false,
      requestRefresh: false,
      presetElements: false
    }
    this.darkTask = []
    this.view = null
    this.img = null
  }
  public saveMirroring(): Promise<boolean> {
    if (!this.config.useMirroring || !this.sameOrigin) {
      return Promise.resolve(false)
    }

    const key = '__MODULE_IMG__' + this.id
    const documentHTML = this.mirroringHTML ?? ''

    try {
      localStorage.setItem(key, documentHTML)
      return Promise.resolve(true)
    } catch {
      localStorage.clear()
      localStorage.setItem(key, documentHTML)
      return Promise.resolve(false)
    }
  }
  public setActionOrigin(origin?: SegueActionOrigin): void {
    if (!origin) return
    this.segueActionOrigin = origin
  }
  public getActionOrigin(): SegueActionOrigin | undefined {
    return this.segueActionOrigin
  }
  public injectWindowVisibilityState(visibility: Window['appletVisibilityState']): void {
    if (this.sameOrigin) {
      const contentWindow = this.contentWindow
      if (contentWindow) {
        contentWindow.appletVisibilityState = visibility
      }
    }
  }
  public triggerWindow(type: string): void {
    this.contentWindow?.postMessage({
      type,
      appletId: this.id,
      historyDirection: this.application.segue.historyDirection
    }, '*')
  }
}

export {
  AppletState
}
