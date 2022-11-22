import { AppletControlsState } from './State'

export class AppletControlsEventTarget extends AppletControlsState {
  private available = true
  private toggleLock = false
  public requestGoBack(degree: number): void {
    const applet = this.applet
    if (applet.transforming) return
    if (this.toggleLock === false && degree <= this.advanceDegree) {
      if (this.application.activityApplet === applet) {
        this.toggleLock = true
        setTimeout(() => {
          this.toggleLock = false
        }, 300)
        this.application.segue.back('controls').then(() => {
          this.fromViewports = undefined
        })
      }
    }
  }
  public bindCoreEvent(): void {
    const applet = this.applet
    const viewports = this.viewports
    const prevViewport = viewports[1]
    const swipeTransitionType = this.application.config.swipeTransitionType
    this.controlsView.addEventListener('scroll', () => {
      const degree = this.degree
      this.requestGoBack(degree)
      this.backdropView.style.opacity = `${degree}`
      requestAnimationFrame(() => {
        if (degree > 1) {
          this.controlsView.style.backgroundColor = `rgba(0, 0, 0, ${0.5 + 3 * (degree - 1)})`
        } else {
          this.controlsView.style.backgroundColor = 'transparent'
        }
        if (prevViewport && applet.visibility && !applet.transforming && !this.toggleLock) {
          if (swipeTransitionType === 'slide') {
            prevViewport.style.transform = `translate3d(${-degree * 30}%, 0, 0)`
          } else {
            prevViewport.style.transform = `scale(${1 - degree * 0.03})`
          }
        }
      })
      this.application.trigger('transition', degree, this.application.segue.appletGroup)
    })
    this.backdropView.addEventListener('touchstart', async () => {
      await this.hide()
      this.requestGoBack(this.degree)
    })
    this.controlsOverlay.addEventListener('touchstart', (event) => {
      event.stopPropagation()
      event.preventDefault()
    }, false)
    // when history back
    this.applet.on('show', () => {
      if (!this.visibility) {
        this.appearImmediately()
      }
      this.prepare()
    })
    // isOverscrollHistoryNavigation
    this.applet.on('hide', () => {
      if (this.visibility && this.historyBack) {
        this.disappearImmediately()
      }
    })
  }
  public prepare() {
    const viewports = this.viewports
    const swipeTransitionType = this.application.config.swipeTransitionType
    const prevViewport = viewports[1]
    // Block impressions triggered by sliding card subviews, etc
    // if (viewports[0] !== this.applet.viewport) return
    if (prevViewport) {
      if (swipeTransitionType === 'slide') {
        prevViewport.style.transform = 'translate3d(30%, 0, 0)'
      } else {
        prevViewport.style.transform = `scale(${1 - this.backdropReducedScale})`
      }
    }
  }
  public async switch(show: boolean): Promise<void> {
    this.controlsOverlay.style.display = 'block'
    if (show) {
      this.disappearImmediately()
    }
    this.toggleLock = true
    return this.scroll.snapTo(show ? this.appletViewport.offsetWidth : 0, 0).then(() => {
      this.toggleLock = false
      this.controlsOverlay.style.display = 'none'
    })
  }
  public disappearImmediately() {
    this.controlsView.style.scrollBehavior = 'auto'
    this.controlsView.scrollLeft = 0
  }
  public appearImmediately() {
    this.controlsView.style.scrollBehavior = 'auto'
    this.controlsView.scrollLeft = this.appletViewport.offsetWidth
  }
  public show(): Promise<void> {
    return this.switch(true)
  }
  public hide(): Promise<void> {
    return this.switch(false)
  }
  public disable() {
    this.available = false
  }
  public enable() {
    this.available = true
  }
  public activate(): void {
    if (this.available === false) return
    this.backdropView.style.display = 'block'
    this.controlsView.style.overflow = 'auto'
    this.controlsView.scrollLeft = this.appletViewport.offsetWidth
  }
  public freeze(): void {
    this.backdropView.style.display = 'none'
    this.controlsView.style.overflow = 'hidden'
  }
}
