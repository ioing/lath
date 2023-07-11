import { AppletEventTarget } from './EventTarget'
import { Sandbox } from '../Sandbox'
import { AppletControls } from '../AppletControls'
import { Slide } from '../Slide'
import { Modality } from '../Modality'
import { setTimeout } from '../lib/util'
import typeError from '../lib/typeError'
import { coveredCSSText } from '../lib/cssText/coveredCSSText'
import { fullscreenBaseCSSText } from '../lib/cssText/fullscreenBaseCSSText'
import { injectContext, injectDocument } from './inject'
import { SandboxOptions, DefineApplet } from '../types'


class AppletView extends AppletEventTarget {
  private setShadowView(shadowbox: HTMLElement, shadowboxInner: HTMLElement) {
    if (['frameworks', 'system'].includes(this.rel)) {
      shadowbox.style.cssText = `
        position: fixed;
        width: 100%;
        z-index: 7;
        pointer-events: none;
      `
      shadowboxInner.style.pointerEvents = 'all'
    } else {
      shadowbox.style.cssText = shadowboxInner.style.cssText = `
        min-width: 100%;
        min-height: 100%;
      `
    }
  }
  private createControlsView(): HTMLElement {
    this.controls = new AppletControls(this.self)
    return this.controls?.create()
  }
  private getContentContainer(): HTMLElement {
    if (this.rel === 'system') return this.viewport as HTMLElement
    if (this.isModality) return this.createModality()
    if (this.useControls) return this.createControlsView()
    return this.viewport as HTMLElement
  }
  private buildSlideView(target: HTMLElement): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.slide) return resolve()
      if (!this.config.defaultSlideViewApplets) return reject()
      const options = {
        openSlideViewLeftHolder: this.config.openSlideViewLeftHolder ?? true,
        slideViewSnapType: this.config.slideViewSnapType ?? 'x'
      }
      this.slide = new Slide(this.self, options, target)
      resolve()
    })
  }
  private buildContentImage(): void {
    if (this.img) return
    const viewport = this.viewport as HTMLElement
    const img = document.createElement('applet-img')
    if (this.noShadowDom === false) {
      img.attachShadow?.({ mode: 'open' })
    }
    viewport.appendChild(img)
    img.style.cssText = `
      position: absolute;
      ${fullscreenBaseCSSText}
      z-index: 2;
      pointer-events: none;
      background: ${this.color};
      opacity: 1;
      transition: opacity .3s;
      contain: layout size;
    `
    this.img = img
  }
  private getPresetView(): DefineApplet | undefined {
    return this.application.presetAppletsView?.[this.id]
  }
  private createContentView(): DefineApplet {
    const contentView = document.createElement('define-applet') as DefineApplet
    this.application.defineApplet(contentView, this.id)
    return contentView
  }
  private getContentView(): DefineApplet {
    const contentView = this.getPresetView() ?? this.createContentView()
    if (this.rel === 'applet') {
      // don't set min-width/min-height, save free.
      contentView.style.cssText = `
        position: relative;
        z-index: 1;
        display: block;
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
        overflow: auto;
        background: transparent;
      `
    }
    return contentView
  }
  private setContentViewColor(): void {
    if (!this.contentView) return
    this.contentView.style.background = this.color
  }
  private buildContentStructure(): void {
    if (this.contentView) return
    this.contentView = this.getContentView()
    this.contentSlot = this.contentView.getViewSlot() as HTMLSlotElement
    const contentContainer = this.getContentContainer()
    if (this.config.defaultSlideViewApplets) {
      this.buildSlideView(contentContainer)
    }
    const contentSlot = this.contentSlot
    // Prevent flicker
    this.application.awaitInstalled().then(() => {
      contentContainer.appendChild(contentSlot)
    })
  }
  private createShadowView(): Promise<HTMLElement | null> {
    if (!this.config.render) return Promise.resolve(this.contentView as DefineApplet)
    const shadowbox = document.createElement('applet-shadow')
    const shadowboxInner = document.createElement('applet-shadow-inner')
    if (this.noShadowDom === false) shadowbox.attachShadow?.({ mode: 'open' })
    const shadowRoot = shadowbox.shadowRoot ? shadowbox.shadowRoot : shadowbox
    shadowRoot.appendChild(shadowboxInner)
    this.config.render?.(shadowboxInner)
    this.contentView?.appendChild(shadowbox)
    this.setShadowView(shadowbox, shadowboxInner)
    return Promise.resolve(shadowbox)
  }
  private async createSandbox(uri?: string, config?: SandboxOptions): Promise<HTMLIFrameElement> {
    this.sandbox = new Sandbox(uri, config?.join(' '), 'src')
    this.decorateSandbox(this.sandbox.sandbox)
    await this.loadContentView()
    return this.sandbox.sandbox
  }
  private async createPortal(uri: string): Promise<HTMLPortalElement> {
    const portal = document.createElement('portal') as HTMLPortalElement
    portal.src = uri
    this.decorateSandbox(portal)
    await this.loadContentView()
    return portal
  }
  private createModality() {
    this.modality = new Modality(this.self)
    return this.modality.create()
  }
  private async loadContentView(): Promise<void> {
    this.waitingForResponse().then(() => {
      Promise.resolve()
    }).catch(() => {
      Promise.reject()
    })
    if (this.status.refreshing) {
      setTimeout(() => {
        Promise.resolve()
      }, 2000)
      return
    }
    Promise.resolve()
  }
  private async loadSourceContent(): Promise<void> {
    const contentView = this.contentView
    if (this.viewType === 'portal') {
      contentView?.appendChild(this.view as HTMLPortalElement)
      return Promise.resolve()
    }
    const sandbox = this.sandbox
    if (!sandbox) return Promise.resolve()
    if (this.uri) {
      sandbox.setOnLoad(() => {
        sandbox.setOnUnload(this.loadSourceContent.bind(this)).catch(() => {
          typeError(1201, 'warn')
        })
        Promise.resolve()
      })
      sandbox.setOnError(() => Promise.reject())
      sandbox.enter(contentView as HTMLElement)
      this.injectIntoContext()
      this.injectIntoContext(2)
    } else {
      sandbox.enter(contentView as HTMLElement)
      this.injectIntoContext()
      sandbox.append(await this.source)
      this.injectIntoContext(2)
      sandbox.setOnUnload(this.loadSourceContent.bind(this)).catch(() => {
        typeError(1201, 'warn')
      })
      Promise.resolve()
    }
  }
  private injectIntoContext(stage: 1 | 2 = 1) {
    if (!this.sameOrigin) return
    const contentWindow = this.contentWindow
    if (contentWindow.__LATH_APPLICATION_AVAILABILITY__) {
      typeError(1202, 'warn')
      return
    }
    if (stage === 2) {
      injectDocument(contentWindow, this)
      contentWindow.__LATH_APPLICATION_TUNNELING__ = true
      if (this.config.apply?.length) {
        contentWindow.__LATH_APPLICATION_AVAILABILITY__ = true
      }
    } else {
      injectContext(contentWindow, this)
    }
  }
  private loadMirrorImage(): void {
    if (this.status.refreshing) return
    if (!this.config.useMirroring || this.img) return
    this.buildContentImage()
    this.setImageContent(this.mirroringString || '')
  }
  private setImageContent(source: HTMLElement | string): void {
    const img = this.img as HTMLElement
    const imgRoot = img.shadowRoot || img
    if (typeof source === 'string') {
      imgRoot.innerHTML = source
    } else {
      imgRoot.appendChild(source)
    }
  }
  private removeMirrorImage(): void {
    if (!this.img) return
    if (this.status.refreshing) return
    const img = this.img
    setTimeout(() => {
      img.style.opacity = '0'
      img.parentNode?.removeChild(img)
      this.img = null
    }, 300)
  }
  private decorateSandbox(view: HTMLIFrameElement): void {
    view.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      ${coveredCSSText}
      border: 0;
      outline: 0;
    `
  }
  private waitingForResponse(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.loadSourceContent().then(() => {
        this.status.prerender = true
        this.events?.load(this.self)
        this.trigger('load')
        this.attachEvent()
        setTimeout(() => {
          resolve()
        }, 0)
      }).catch(() => {
        this.events?.loadError(this.self)
        this.trigger('loadError')
        reject()
      })
    })
  }
  private createView(): Promise<HTMLElement | null> {
    if (this.viewType === 'shadow') {
      return this.createShadowView()
    } else if (this.viewType === 'portal') {
      return this.createPortal(this.uri)
    } else {
      return this.createSandbox(this.uri, this.config.sandbox)
    }
  }
  private async buildMainView(): Promise<void> {
    this.cancelGuard()
    if (this.expired) return this.refresh()
    if (this.view) return Promise.resolve()
    this.createTime = Date.now()
    this.loadMirrorImage()
    this.buildContentStructure()
    this.injectIntoContext()
    this.injectIntoContext(2)
    this.view = await this.createView()
    this.setContentViewColor()
    this.removeMirrorImage()
    return Promise.resolve()
  }
  public async build(): Promise<void> {
    await this.buildMainView()
    return Promise.resolve()
  }
  public async refresh(): Promise<void> {
    if (this.status.refreshing || !this.view) return Promise.reject()
    this.status.refreshing = true
    if (typeof this.config.refresh === 'function') {
      await this.config.refresh()
      this.status.refreshing = false
      this.trigger('refreshing')
      return
    }
    if (this.isPresetAppletsView || (this.rel !== 'applet' && this.noSource)) {
      this.status.refreshing = false
      return
    }
    const contentView = this.contentView as DefineApplet
    const contentSlot = this.contentSlot as HTMLSlotElement
    const discardView = this.view
    contentView.setAttribute('applet-id', `${this.id}-obsolete`)
    contentSlot.name = `applet-${this.id}-obsolete`
    this.application.delPresetAppletsView(this.id)
    this.contentView = undefined
    if (this.rel === 'applet' && this.noSource) {
      this.config.source = {
        src: location.href
      }
    }
    this.contentView = this.getContentView()
    this.view = await this.createView()
    this.setContentViewColor()
    contentSlot.name = `applet-${this.id}`
    this.status.refreshing = false
    this.trigger('refreshing')
    if (discardView.tagName === 'IFRAME') {
      this.unload(discardView as HTMLIFrameElement)
    }
    discardView.parentNode?.removeChild(discardView)
    contentView.parentElement?.removeChild(contentView)
  }
  public async captureShot(update = true): Promise<HTMLCanvasElement> {
    if (!update && this.snapshot && this.snapshotTime === this.createTime) {
      return this.snapshot
    }
    this.snapshotTime = this.createTime
    return import('./captureShot').then(async (captureShot) => {
      return captureShot.capture(this.self).then((snapshot) => {
        return this.snapshot = snapshot
      })
    })
  }
}

export {
  AppletView
}
