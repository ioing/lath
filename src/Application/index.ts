import { ApplicationState } from './State'
import { Applet } from '../Applet/index'
import { Segue } from '../Segue'
import provider from './provider'
import typeError from '../lib/typeError'
import { globalCSSText } from '../lib/cssText/globalCSSText'
import { setTimeout, testHasSlotBug } from '../lib/util'
import { PresetConfig, AppletManifest, AppletConfig, FrameworksAppletConfig, AppSwitcher, ApplicationSafeAreaValue, GlobalCSSVariables, SegueActionOrigin, DefineApplet } from '../types'

class Application extends ApplicationState {
  public tunneling = false
  public presetConfig: PresetConfig
  public appSwitcher!: AppSwitcher
  public root: HTMLElement | ShadowRoot
  public appletsSpace: HTMLElement
  public pullRefreshHolder: {
    holder: HTMLElement | null
    spinner: HTMLElement | null
    holdLayer: HTMLElement | null
  } = { holder: null, spinner: null, holdLayer: null }
  private working = false
  constructor(presetConfig: PresetConfig = {} as PresetConfig) {
    super()
    this.root = presetConfig.root as ShadowRoot
    this.appletsSpace = presetConfig.appletsSpace as HTMLElement
    this.tunneling = parent !== window && !!presetConfig.tunneling && parent.__LATH_APPLICATION_AVAILABILITY__
    this.segue = new Segue(this, presetConfig)
    this.presetConfig = presetConfig
    this.to = this.segue.to.bind(this.segue)
    this.activateTunneling()
    provider(this)
    this.setBaseStyle()
  }
  private setBaseStyle() {
    const style = document.createElement('style')
    style.innerHTML = globalCSSText
    document.head.appendChild(style)
  }
  public add(id: string, manifest: AppletManifest): Applet {
    if (this.applets[id]) {
      return this.applets[id]
    }
    if (this.config) {
      const { appletManifestProcess, animationUnderUntouchable = 'fade', modalityUnderUntouchable = 'overlay' } = this.config
      const animationType = manifest.config.animationUnderUntouchable ?? animationUnderUntouchable
      const modalityType = manifest.config.modalityUnderUntouchable ?? modalityUnderUntouchable
      if (appletManifestProcess) {
        manifest = appletManifestProcess(manifest) || manifest
      }
      if (!("ontouchend" in document)) {
        if (animationType) {
          manifest.config.animation = animationType
        }
        if (manifest.config.modality) {
          manifest.config.modality = modalityType
        }
      }
    }
    return this.applets[id] = new Applet(id, manifest, this)
  }
  public del(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const applet = this.applets[id]
      if (applet.view) {
        applet.destroy().then(resolve).catch(reject)
      } else {
        resolve(true)
      }
      delete this.applets[id]
    })
  }
  public async get(id: string): Promise<Applet> {
    if (typeof this.applets[id] === 'object') return Promise.resolve(this.applets[id])
    const appletPromise = this.options.applets[id]
    switch (typeof appletPromise) {
      case 'function':
        return Promise.resolve(this.add(id, await this.promiseApplet(appletPromise)))
      case 'object':
        return Promise.resolve(this.add(id, appletPromise))
      case 'string':
        if (this.verifyAppletSrcLegitimacy(id)) {
          return await this.createAppletByURL(id, {}, id) ?? Promise.reject()
        } else {
          return Promise.reject()
        }
      default:
        return Promise.reject()
    }
  }
  public defineApplet(defineApplet: DefineApplet, id: string) {
    defineApplet.setAttribute('applet-id', id)
    this.appletsSpace.appendChild(defineApplet)
    /**
     * Obsolete
     */
    // @bug: ios <= 13
    if (testHasSlotBug() === true) {
      setTimeout(() => {
        defineApplet.slot = 'none'
        setTimeout(() => {
          defineApplet.slot = 'applet-' + id
        }, 0)
      }, 0)
    }
  }
  public cloneAsNewApplet(applet: Applet, id?: string, config = {}): Applet {
    if (!id) return applet
    const newConfig = Object.assign({}, applet.model.config, config)
    const newApplet = this.add(id, Object.assign({}, applet.model, { config: newConfig }))
    return newApplet
  }
  public async getAppletByURL(url: string): Promise<Applet | undefined> {
    const transfer = this.config.transfer
    if (transfer) {
      const appletName = transfer(url)
      if (typeof appletName === 'string') {
        return this.get(appletName)
      }
    }
    const applets = this.applets
    const resolve = this.resolveURL(url)
    const path = resolve.origin + resolve.pathname
    for (const id in applets) {
      const applet = applets[id]
      const capture = applet.config.capture
      if (applet.rel !== 'applet') continue
      if (capture && this.captureAppletSrc(url, capture)) return applet
      if (applet.uri === path) return applet
    }
    return
  }
  public async createAppletByURL(url: string, config?: {
    [key in Extract<keyof AppletConfig, string>]?: string | number
  }, cloneAs?: string): Promise<Applet | undefined> {
    const newAppletId = decodeURIComponent(url)
    const applets = this.applets
    const sameApplet = applets[newAppletId] ?? await this.getAppletByURL(url)
    if (sameApplet) return cloneAs ? this.cloneAsNewApplet(sameApplet, cloneAs, config) : sameApplet
    const transient = this.config.disableTransient === true ? false : true
    return this.add(newAppletId, {
      config: Object.assign({
        title: '',
        rel: 'applet',
        free: true,
        source: {
          src: url
        },
        background: 'auto',
        timeout: transient ? 0 : this.config.transientTimeout ?? 60000,
        animation: 'inherit',
        color: this.config.color,
        transient
      }, config)
    })
  }
  public async pushWindow(url: string, title = '', preset = 'slide', cloneAs?: string, touches?: SegueActionOrigin): Promise<void> {
    if (!this.verifyAppletSrcLegitimacy(url)) {
      return Promise.reject('Illegal')
    }
    if (this.tunneling) {
      parent.postMessage({
        action: 'pushWindow',
        data: [url, title, preset, cloneAs, touches]
      }, '*')
      return Promise.resolve()
    }
    const resolve = this.resolveURL(url)
    if (resolve.protocol.indexOf('http') === -1) {
      return Promise.reject('Unknown')
    }
    const search = resolve.search
    const applet = await this.createAppletByURL(url, {
      title,
      animation: preset,
      level: this.activityLevel
    }, cloneAs)
    if (applet) {
      return this.segue.to(applet.id, applet.config?.source?.html ? search : '', 1, touches)
    } else {
      return Promise.reject()
    }
  }
  public pullDependencies(dependencies: string[] = [], prerender = true): Promise<unknown> {
    const allPromise: Promise<unknown>[] = []
    for (const dep of dependencies) {
      allPromise.push(new Promise((resolve, reject) => {
        this.get(dep).then((applet) => {
          if (prerender) {
            applet.prerender().then(resolve).catch(resolve)
          } else {
            resolve('')
          }
        }).catch(reject)
      }))
    }
    return Promise.all(allPromise)
  }
  public updateSafeArea(data: ApplicationSafeAreaValue): void {
    this.trigger('safeAreaChange', data)
  }
  public updateGlobalCSSVariables(data: GlobalCSSVariables): void {
    this.trigger('globalCSSVariablesChange', data)
  }
  public refresh() {
    for (const id in this.applets) {
      const applet = this.applets[id]
      if (applet.visibility) {
        applet.refresh()
      } else {
        applet.status.requestRefresh = true
      }
    }
  }
  private createAppSwitcher() {
    import('../AppSwitcher').then(({ AppSwitcher }) => {
      this.appSwitcher = new AppSwitcher(this)
    }).catch((e) => {
      console.warn(e)
    })
  }
  private createPullToRefreshHolder() {
    import('../pullToRefresh').then((PullRefresh) => {
      this.pullRefreshHolder = PullRefresh.createPullToRefreshHolder(this.properties.darkTheme, this.segue.fixedViewport)
      this.trigger('pullToRefreshAvailable')
    }).catch((e) => {
      console.warn(e)
    })
  }
  private mountSystem(): void {
    if (this.options.applets.system) {
      this.get('system').then((applet) => {
        this.segue.attachAppletViewport(applet)
        applet.build().then(() => this.trigger('systemDidMount', applet))
      })
    }
  }
  private async mountFramework(): Promise<void | [void, void]> {
    return this.get('frameworks').then((applet) => {
      const route = this.route
      const config = applet.config as FrameworksAppletConfig
      const index = config.index || ''
      const preIndex = config.preIndex
      const id = route.id || index
      this.config = config
      this.segue.setup({
        singleFlow: config.singleFlow,
        singleLock: config.singleLock,
        index,
        defaultIndex: id,
        oneHistory: config.oneHistory,
        notFound: config.notFound || index,
        limit: Math.max(config.limit || 7, 2),
        defaultAnimation: config.animation,
        holdBack: config.holdBack,
        swipeTransitionType: config.swipeTransitionType,
        swipeModel: applet.swipeModel
      })
      return Promise.all([
        this.segue.to('frameworks', undefined, -1).then(() => {
          if (config.pullToRefresh) {
            this.createPullToRefreshHolder()
          }
          if (config.appSwitcher) {
            this.createAppSwitcher()
          }
          this.trigger('frameworksDidMount', applet)
          window.dispatchEvent(new CustomEvent('lathApplicationReady', {
            detail: {
              application: this
            }
          }))
        }),
        this.mountFirstApplet(id, index, preIndex, config.oneHistory).then(() => {
          if (this.segue.id === id) return
          const resolve = this.resolveURL(id)
          if (resolve.origin !== location.origin) {
            this.pushWindow(id)
          }
        })
      ])
    }).catch(() => {
      typeError(1007)
    })
  }
  private async createCloneApplet(id: string): Promise<void> {
    const idSplit = id.split('^')
    if (idSplit.length === 1) return Promise.resolve()
    await this.get(idSplit[1]).then((applet) => {
      const appletManifest = applet.model
      Object.assign(appletManifest.config, {
        level: this.activityLevel
      })
      this.add(id, appletManifest)
    }).catch(() => {
      typeError(1008, 'error', id)
    })
  }
  private async lineUpApplet(id: string, params: string, history: -1 | 0 | 1): Promise<void> {
    const applet = await this.get(id)
    const { antecedentApplet } = applet.config
    if (antecedentApplet) {
      for (const antecedentId of antecedentApplet) {
        this.segue.to(antecedentId, params, 1)
      }
      this.segue.to(id, params, 1)
    } else {
      this.segue.to(id, params, history)
    }
    return Promise.resolve()
  }
  private async mountFirstApplet(id: string, index: string, preIndex?: string, oneHistory?: boolean): Promise<void> {
    await this.createCloneApplet(id)
    if (oneHistory) {
      this.segue.pushState(index || 'frameworks')
      if (id) {
        return this.lineUpApplet(id, location.search, 1)
      }
      return Promise.resolve()
    }
    if (id !== index && id !== preIndex) {
      if (!index && !preIndex) this.segue.pushState('frameworks')
      if (preIndex) this.segue.pushState(preIndex)
      if (id) {
        return this.lineUpApplet(id, location.search, this.exists ? -1 : 1)
      }
      return Promise.resolve()
    }
    if (id) {
      return this.lineUpApplet(id, location.search, -1)
    }
    return Promise.resolve()
  }
  public activateTunneling(): void {
    window.addEventListener('message', (event: MessageEvent) => {
      const { type } = event.data
      const activityApplet = this.activityApplet
      if (event.source === window) return
      switch (type) {
        case 'applet-show':
          activityApplet?.show()
          break
        case 'applet-hide':
          activityApplet?.hide()
          break
        case 'applet-will-show':
          activityApplet?.willShow()
          break
        case 'applet-will-hide':
          activityApplet?.willHide()
          break
        case 'application-active':
          this?.activate(true)
          break
        case 'application-frozen':
          this?.activate(false)
          break
      }
    })
  }
  public async start(): Promise<void> {
    if (!this.options.applets) {
      return Promise.reject('Please configure the applet first!')
    }
    if (this.working) return Promise.reject('repeat')
    this.working = true
    this.setExists()
    return this.mountFramework().then(() => {
      this.trigger('firstAppletDidMount')
      this.mountSystem()
    })
  }
}

export {
  Application
}
