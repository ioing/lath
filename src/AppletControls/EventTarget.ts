import { AppletControlsState } from './State'
export class AppletControlsEventTarget extends AppletControlsState {
  private available = true
  private toggleLock = false
  private requestGoBack(degree: number): void {
    const applet = this.applet
    if (applet.transforming) return
    if (this.toggleLock === false && degree <= this.advanceDegree && this.activity) {
      this.toggleLock = true
      setTimeout(() => {
        this.toggleLock = false
      }, 300)
      this.application.segue.back('controls').then(() => {
        this.fromViewports = undefined
      })
    }
  }
  private sliding(): void {
    const applet = this.applet
    const viewports = this.viewports
    const prevViewport = viewports[1]
    const swipeTransitionType = this.swipeTransitionType
    const degree = this.degree
    this.requestGoBack(degree)
    this.backdropView.style.transitionDuration = '0ms'
    this.backdropView.style.transitionDelay = '0ms'
    this.backdropView.style.transitionProperty = 'opacity'
    this.backdropView.style.opacity = `${degree}`
    this.controlsView.style.transitionDuration = '0ms'
    this.controlsView.style.transitionDelay = '0ms'
    this.controlsView.style.transitionProperty = 'background-color'
    if (degree > 1) {
      this.controlsView.style.backgroundColor = `rgba(0, 0, 0, ${0.5 + 3 * (degree - 1)})`
    } else {
      this.controlsView.style.backgroundColor = 'transparent'
    }
    if (prevViewport && applet.visibility && !applet.transforming && !this.toggleLock) {
      prevViewport.style.transitionDuration = '0ms'
      prevViewport.style.transitionDelay = '0ms'
      prevViewport.style.transitionProperty = 'transform'
      if (swipeTransitionType === 'slide') {
        prevViewport.style.transform = `translate3d(${-degree * 30}%, 0, 0)`
      } else {
        prevViewport.style.transform = `scale(${1 - degree * 0.03})`
      }
    }
    this.application.trigger('transition', degree, this.application.segue.appletGroup)
  }
  private slidingListener = this.sliding.bind(this)
  private bindSlidingEvent(): void {
    this.controlsView.addEventListener('scroll', this.slidingListener)
  }
  private removeSlidingEvent(): void {
    this.controlsView.removeEventListener('scroll', this.slidingListener)
  }
  protected bindBaseEvent(): void {
    this.backdropView.addEventListener('touchstart', async () => {
      await this.hide()
      this.requestGoBack(this.degree)
    })
    this.controlsOverlay.addEventListener('touchstart', (event) => {
      event.stopPropagation()
      event.preventDefault()
    }, false)
    // update viewports
    this.applet.on('willShow', () => {
      if (this.application.segue.stackUp) {
        this.clearFromViewports()
      }
    })
    // when history back
    this.applet.on('show', () => {
      if (!this.visibility) {
        this.appearImmediately()
      }
      if (this.application.segue.stackUp) {
        this.prepare()
      }
    })
    // isOverscrollHistoryNavigation
    this.applet.on('hide', () => {
      if (this.visibility && this.application.segue.fromOverscrollHistoryNavigation) {
        this.disappearImmediately()
      }
    })
  }
  public prepare(reset = false) {
    const viewports = this.viewports
    const swipeTransitionType = this.swipeTransitionType
    const prevViewport = viewports[1]
    if (prevViewport) {
      if (swipeTransitionType === 'slide') {
        prevViewport.style.transform = reset ? 'translate3d(0, 0, 0)' : 'translate3d(-30%, 0, 0)'
      } else {
        prevViewport.style.transform = reset ? 'scale(1)' : `scale(${1 - this.backdropReducedScale})`
      }
    }
  }
  public async switch(show: boolean): Promise<void> {
    this.controlsOverlay.style.display = 'block'
    this.toggleLock = true
    return this.scroll.snapTo(show ? this.appletViewport.offsetWidth : 0, 0).then(() => {
      this.toggleLock = false
      this.controlsOverlay.style.display = 'none'
    })
  }
  public async disappearImmediately() {
    this.controlsView.style.scrollBehavior = 'auto'
    this.controlsView.scrollLeft = 1 + this.advanceDegree
  }
  public async appearImmediately() {
    this.controlsView.style.scrollBehavior = 'auto'
    this.controlsView.scrollLeft = this.appletViewport.offsetWidth
  }
  public async show(): Promise<void> {
    return this.switch(true).then(() => {
      this.bindSlidingEvent()
    })
  }
  public async hide(): Promise<void> {
    return this.switch(false).then(() => {
      this.removeSlidingEvent()
    })
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
    this.bindSlidingEvent()
  }
  public freeze(): void {
    this.removeSlidingEvent()
    this.backdropView.style.display = 'none'
    this.controlsView.style.overflow = 'hidden'
  }
}
