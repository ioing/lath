import { AppletState } from './State'
import { Applet, AppletAttachBehavior } from '../types'
import { setTimeout } from '../lib/util'
class AppletLifeCycle extends AppletState {
  private mutationObserver!: MutationObserver

  public attach(element: HTMLElement, parentApplet?: Applet, mountBehavior?: AppletAttachBehavior): void {
    if (!element) return
    this.viewport = element
    this.parentApplet = parentApplet
    this.mountBehavior = mountBehavior
  }

  public removeContainer() {
    if (!this.isPresetAppletsView) {
      this.contentView?.parentElement?.removeChild(this.contentView)
      this.viewport?.parentNode?.removeChild(this.viewport as HTMLElement)
    }
    this.viewport = undefined
    this.delPresetView()
  }

  public clearContainer() {
    if (!this.isPresetAppletsView) {
      this.contentView?.parentElement?.removeChild(this.contentView)
    }
    if (this.viewport) {
      this.viewport.innerHTML = ''
    }
    this.delPresetView()
  }

  public delPresetView() {
    this.contentView = undefined
    this.application.delPresetAppletsView(this.id)
  }

  public setParam(param: string): Promise<boolean> {
    if (this.param !== param) {
      this.param = param
      return this.destroy(true)
    }
    return Promise.resolve(true)
  }

  public show(): void {
    const viewType = this.viewType
    if (viewType === 'portal') {
      (this.view as HTMLPortalElement)?.activate()
      return
    }
    for (const task of this.darkTask) {
      task()
    }
    this.transforming = false
    this.darkTask = []
    this.visibility = true
    this.visitTime = Date.now()
    this.trigger('show')
    if (viewType === 'iframe') {
      this.triggerWindow('applet-show')
      this.injectWindowVisibilityState('visible')
    }
    this.subApplet?.show()
  }

  public hide(): void {
    this.transforming = false
    this.visibility = false
    this.trigger('hide')
    if (this.viewType === 'iframe') {
      this.triggerWindow('applet-hidden')
      this.injectWindowVisibilityState('hidden')
    }
    this.subApplet?.hide()
  }

  public willShow(): void {
    this.transforming = true
    this.trigger('willShow')
    if (this.viewType === 'iframe') {
      this.triggerWindow('applet-will-show')
      this.injectWindowVisibilityState('willVisible')
    }
    this.subApplet?.willShow()
  }

  public willHide(): void {
    this.transforming = true
    this.trigger('willHide')
    if (this.viewType === 'iframe') {
      this.triggerWindow('applet-will-hide')
      this.injectWindowVisibilityState('willHidden')
    }
    this.subApplet?.willHide()
  }

  public willSegueShow(): void {
    this.trigger('willSegueShow')
  }

  public willSegueHide(): void {
    this.trigger('willSegueHide')
  }

  public destroy(reserve = false): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.view) return resolve(true)
      if (this.status.presetElements === true) return resolve(false)
      if (this.rel === 'frameworks' || this.rel === 'system') return resolve(false)
      if (this.application.segue?.id === this.id && reserve === false) return resolve(false)
      if (this.viewType === 'iframe') this.unload()
      if (reserve === false) this.removeContainer()
      else this.clearContainer()
      this.resume()
      this.events?.destroy(this.self)
      this.application.removeEventGroup(this.id)
      this.trigger('destroy')
      resolve(true)
    })
  }

  public observer(change: (record: MutationRecord[]) => void): MutationObserver | undefined {
    const target = this.sandbox ? this.sandbox.document?.documentElement : this.view
    if (!target) return
    const observer = new MutationObserver((record: MutationRecord[]) => {
      change(record)
    })
    observer.observe(target, {
      subtree: true,
      attributes: true,
      childList: true,
      characterData: true,
      attributeOldValue: true,
      characterDataOldValue: true
    })
    return observer
  }

  public collectAllElements(root: Element): Element[] {
    const allElements: Array<Element> = []
    const findAllElements = function (nodes: NodeListOf<Element>) {
      for (let i = 0; i < nodes.length; i++) {
        const el = nodes[i]
        allElements.push(el)
        if (el.shadowRoot) {
          findAllElements(el.shadowRoot.querySelectorAll('*'))
        }
      }
    }
    if (root.shadowRoot) {
      findAllElements(root.shadowRoot.querySelectorAll('*'))
    }
    findAllElements(root.querySelectorAll('*'))

    return allElements
  }

  public autoMediaController(allElements: Array<Element>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        if (this.viewType !== 'iframe') return resolve()
        if (this.sandbox === undefined) return resolve()
        const videoAndAudioList = allElements.filter(el => el.tagName === 'video' || el.tagName === 'audio')
        for (const index in videoAndAudioList) {
          const videoAndAudio = videoAndAudioList[index] as HTMLVideoElement | HTMLAudioElement
          if (!videoAndAudio?.paused) {
            videoAndAudio.pause()
            this.darkTask.push(() => {
              videoAndAudio.play()
            })
          }
        }
      } catch (error) {
        reject()
      }
    })
  }

  public destructiveTags(allElements: Array<Element>): boolean {
    const blockTags = ['object', 'embed', 'applet', 'iframe']
    const matchTags = allElements.filter(el => blockTags.includes(el.tagName))
    return matchTags.length ? true : false
  }

  public guarding(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (this.rel !== 'applet') return resolve(true)
      if (this.config.background === true) return resolve(true)
      if (this.config.background === false) return resolve(false)
      if (this.viewType !== 'iframe') return resolve(true)
      if (this.sandbox === undefined) return resolve(true)
      if (this.sameOrigin === false) return resolve(false)
      const view = this.view as HTMLIFrameElement
      try {
        const contentDocumentElement = view.contentDocument?.documentElement
        if (!contentDocumentElement) return resolve(true)
        const allElements = this.collectAllElements(contentDocumentElement)
        if (this.config.mediaGuard !== false) this.autoMediaController(allElements).catch(resolve)
        if (this.destructiveTags(allElements)) return resolve(false)
        const counter = { times: 0 }
        const observer = this.observer(() => {
          counter.times++
          if (counter.times > 1000) {
            resolve(false)
            this.mutationObserver.disconnect()
          }
        })
        if (!observer) return
        this.mutationObserver = observer
        setTimeout(() => {
          if (counter.times > 10) resolve(false)
        }, 3000)
      } catch (error) {
        resolve(true)
      }
    })
  }

  public cancelGuard(): void {
    this.mutationObserver?.disconnect()
  }

  public unload(sandbox = this.sandbox?.sandbox): Promise<void> {
    return new Promise<void>((resolve) => {
      this.cancelGuard()
      if (!sandbox) return resolve()
      if (sandbox === this.sandbox?.sandbox) this.saveMirroring()
      /*
       * IFrame Memory Leak when removing IFrames
      */
      try {
        if (sandbox.contentWindow) {
          sandbox.contentWindow.onunload = null
        }
        sandbox.style.display = 'none'
        sandbox.src = 'about:blank'
        const contentWindow = sandbox.contentWindow?.window
        const contentDocument = sandbox.contentDocument
        contentWindow?.location.reload()
        contentDocument?.open()
        contentDocument?.write('')
        contentDocument?.close()
      } catch (error) {
        //
      }
      sandbox.parentNode?.removeChild(sandbox)
      resolve()
    })
  }
}

export {
  AppletLifeCycle
}
