import { ModalityState } from './State'
import { setTimeout, testHasSmoothSnapScrolling, testHasSnapReset, sleep } from '../lib/util'

/**
 * Obsolete
 * ------------- start -------------
 */
// old; ios < 9
const NoSmoothSnapScrolling = testHasSmoothSnapScrolling() === false
// old; ios < 15
const HasSnapReset = testHasSnapReset()
/**
 * Obsolete
 * ------------- end -------------
 */
class ModalityEventTarget extends ModalityState {
  private scrollingTimeoutId = -1
  private freezePosition = -1
  // old; ios < 15
  private fixSnapReset = HasSnapReset ? false : true
  private fallHeight = this.application.isFullscreen ? 40 : 0
  private processPromise!: Promise<void>
  private async switchSheet(hideThresholdScale = 1.5): Promise<void> {
    if (!this.activity) return Promise.resolve()
    if (this.degree <= this.maxDegree / hideThresholdScale) {
      return this.hide()
    } else {
      return this.rise()
    }
  }
  private switchOverlay(open = false): void {
    this.modalityOverlay.style.display = open ? 'block' : 'none'
  }
  private switchSmooth(open = true): void {
    this.modalityContainer.style.scrollBehavior = open ? 'smooth' : 'auto'
  }
  private switchSnap(open = true): void {
    this.modalityContainer.style.scrollSnapType = open ? 'y mandatory' : 'none'
  }
  private switchBackdropColor(open = true): void {
    this.application.segue.applicationViewport.style.backgroundColor = open ? this.options?.backdropColor ?? '#000' : ''
  }
  public freezeSnap() {
    this.modalityPlaceholder.style.display = 'none'
    this.modalityContainer.scrollTop = 0
  }
  public async activateSnap(): Promise<void> {
    this.switchSmooth(false)
    /**
     * Obsolete
     * ------------- start -------------
     */
    if (!HasSnapReset) this.switchSnap(false)
    /**
     * Obsolete
     * ------------- end -------------
     */
    this.modalityPlaceholder.style.display = 'flex'
    this.modalityContainer.scrollTop = this.modalityContainer.offsetHeight + (this.miniCard?.offsetHeight ?? 0)
    await sleep(0)
    this.switchSmooth(true)
    /**
     * Obsolete
     * ------------- start -------------
     */
    // old; ios < 15
    if (!HasSnapReset) this.switchSnap(true)
    /**
     * Obsolete
     * ------------- end -------------
     */
  }
  public async rise(): Promise<void> {
    if (this.switching) return this.processPromise
    this.switching = true
    this.switchOverlay(true)
    const offsetTop = this.modalityContainer.offsetHeight + (this.defaultToLarge ? this.contentContainer.offsetHeight : 0) + (this.miniCard ? (this.degree >= 1 + (this.maxDegree - 1) / 2 ? (this.miniCard?.offsetHeight ?? 0) : 0) : 0)
    return this.processPromise = this.scroller.snapTo(0, offsetTop).then(() => {
      this.switching = false
      this.switchOverlay(false)
    })
  }
  public async fall(): Promise<void> {
    if (this.switching) return this.processPromise
    this.switching = true
    this.switchOverlay(true)
    return this.processPromise = this.scroller.snapTo(0, 0).then(async () => {
      this.switching = false
      this.switchOverlay(false)
    })
  }
  public async hide(): Promise<void> {
    if (!this.activity) return Promise.resolve()
    this.removeSlidingEvent()
    this.segueTransition(false)
    return this.fall().then(async () => {
      if (this.activity) {
        await this.application.segue.back()
      }
    })
  }
  private segueTransition(show = true) {
    const duration = 500
    const delay = 100 // wait switchBackdropColor
    const prevViewport = this.prevViewport
    const relativeDegree = show ? (this.miniCard && !this.defaultToLarge ? 0 : 1) : 0
    const options = this.options
    const darkness = options?.maskOpacity ?? 0.3
    const useFade = options?.useFade
    // stillBackdrop
    const stillBackdrop = this.options?.stillBackdrop
    if (!stillBackdrop) {
      prevViewport.animate([
        {
          borderRadius: `${relativeDegree * this.backdropBorderRadius}px`,
          transform: `
            translate3d(0, ${relativeDegree * this.fallHeight}px, -100px) 
            perspective(${this.backdropPerspective}px) 
            rotateX(${relativeDegree * this.backdropRotateX}deg) 
            scale(${1 - Math.max(relativeDegree * this.backdropReducedScale, 0)})
          `
        }
      ], {
        duration,
        delay,
        fill: 'forwards'
      }).play()
    }
    this.modalityContainer.animate([
      {
        backgroundColor: `rgba(0, 0, 0, ${show ? darkness : 0})`
      }
    ], {
      duration,
      delay,
      fill: 'forwards'
    }).play()
    // reset opacity while "hide"
    if (useFade && !show) {
      // this.contentContainer.style.opacity = '1'
      this.contentContainer.animate([
        {
          opacity: '1'
        }
      ], {
        duration: 0,
        fill: 'forwards'
      }).play()
    }
  }
  private sliding() {
    // this.activity: Prevents asynchronous operations from resetting closed views
    if (!this.activity) return
    const degree = this.degree
    const maxDegree = this.maxDegree
    const prevViewport = this.prevViewport
    const options = this.options
    const darkness = options?.maskOpacity ?? 0.3
    const useFade = options?.useFade
    if (degree > maxDegree) {
      this.contentContainer.animate([
        {
          backgroundColor: `rgba(0, 0, 0, ${darkness + (1 - darkness) * (degree - maxDegree) / 0.2})`
        }
      ], {
        duration: 0,
        fill: 'forwards'
      }).play()
      return
    }
    // if miniCard.
    const relativeDegree = this.miniCard ? (degree - 1) / (maxDegree - 1) : degree
    // stillBackdrop
    const stillBackdrop = this.options?.stillBackdrop ?? (this.miniCard && degree <= 1)
    // this.activity: Prevents asynchronous operations from resetting closed views
    if (this.activity && prevViewport && !stillBackdrop) {
      prevViewport.animate([
        {
          borderRadius: `${Math.min(relativeDegree, 1) * this.backdropBorderRadius}px`,
          transform: `
            translate3d(0, ${relativeDegree * this.fallHeight}px, -100px) 
            perspective(${this.backdropPerspective}px) 
            rotateX(${relativeDegree * this.backdropRotateX}deg) 
            scale(${1 - Math.max(relativeDegree * this.backdropReducedScale, 0)})
          `
        }
      ], {
        duration: 0,
        fill: 'forwards'
      }).play()
    }
    // this.modalityContainer.style.backgroundColor = `rgba(0, 0, 0, ${darkness * Math.min(degree, 1)})`
    this.modalityContainer.animate([
      {
        backgroundColor: `rgba(0, 0, 0, ${darkness * Math.min(degree, 1)})`
      }
    ], {
      duration: 0,
      fill: 'forwards'
    }).play()
    if (useFade) {
      this.contentContainer.animate([
        {
          opacity: `${relativeDegree - ((1 - relativeDegree) * 2)}`
        }
      ], {
        duration: 0,
        fill: 'forwards'
      }).play()
    }

    this.scrolling = true
    clearTimeout(this.scrollingTimeoutId)
    this.scrollingTimeoutId = setTimeout(() => {
      this.scrolling = false
      /**
       * Obsolete
       * ------------- start -------------
       */
      // old; ios < 9
      if (NoSmoothSnapScrolling) {
        if (this.degree === degree) {
          if (degree <= 0.7) {
            this.hide()
          } else {
            this.rise()
          }
        }
      }
      /**
       * Obsolete
       * ------------- end -------------
       */
    }, 100)
    // when triggered by a blocked holder
    if (this.switching) return
    if (degree <= this.advanceDegree) {
      this.hide()
    }
  }
  private slidingListener = this.sliding.bind(this)
  private bindSlidingEvent(): void {
    this.modalityContainer.addEventListener('scroll', this.slidingListener)
  }
  private removeSlidingEvent(): void {
    this.modalityContainer.removeEventListener('scroll', this.slidingListener)
  }
  protected bindDragContentEvent(): void {
    const dragContent = this.applet.contentDocument
    if (!dragContent) return
    const startPoint: {
      x: number
      y: number
      swipe: boolean | undefined
    } = {
      x: 0,
      y: 0,
      swipe: undefined
    }
    const modalityContainer = this.modalityContainer
    const speedRate = modalityContainer.offsetHeight / modalityContainer.offsetWidth
    dragContent.addEventListener('touchstart', (event: Event) => {
      const { changedTouches } = event as TouchEvent
      const touch = changedTouches[0]
      startPoint.x = touch.pageX
      startPoint.y = touch.pageY
      startPoint.swipe = undefined
    }, true)
    dragContent.addEventListener('touchend', async () => {
      if (!startPoint.swipe) return
      startPoint.swipe = false
      if (!await this.checkScrollStop()) return
      this.switchSmooth(true)
      this.switchSnap(true)
      this.switchSheet(this.miniCard ? 2 : 1.25).then(() => {
        this.switchOverlay(false)
        this.switching = false
      })
    }, true)
    dragContent.addEventListener('touchmove', (event: Event) => {
      const { changedTouches } = event as TouchEvent
      const touch = changedTouches[0]
      const deltaX = touch.pageX - startPoint.x
      const deltaY = touch.pageY - startPoint.y
      if (this.switching) return
      if (startPoint.swipe === false) return
      if (Math.abs(deltaX) - Math.abs(deltaY) > 20 && Math.abs(deltaY) <= 10) {
        startPoint.swipe = true
        this.switchOverlay(true)
        this.switchSmooth(false)
        this.switchSnap(false)
      }
      if (startPoint.swipe) {
        modalityContainer.scrollTop -= Math.ceil(deltaX) * speedRate
        startPoint.x = touch.pageX
        startPoint.y = touch.pageY
      }
    }, true)
  }
  protected bindBaseEvent() {
    this.applet.on('willShow', () => {
      this.switchBackdropColor(true)
      if (this.application.segue.stackUp) {
        this.fromViewports = undefined
      }
    })
    this.applet.on('willSegueShow', () => {
      this.segueTransition(true)
    })
    this.applet.on('show', () => {
      this.bindSlidingEvent()
    })
    this.applet.on('willHide', () => {
      this.removeSlidingEvent()
    })
    this.applet.on('willSegueHide', () => {
      this.segueTransition(false)
    })
    this.applet.on('hide', () => {
      this.switchBackdropColor(false)
    })
  }
  public freeze(): void {
    this.removeSlidingEvent()
    if (this.fixSnapReset === false) {
      // (offsetTop) ios < 15, Get the scroll position of the snap as 0.
      this.freezePosition = this.modalityContainer.scrollTop || this.contentContainer.offsetTop
      this.modalityPlaceholder.style.display = 'none'
    }
  }
  public activate(): void {
    if (this.fixSnapReset === false && this.freezePosition !== -1) {
      this.modalityPlaceholder.style.display = 'block'
      const freezePosition = this.freezePosition
      this.modalityContainer.scrollTop = freezePosition
      this.scroller.snapTo(0, freezePosition, 0)
      this.freezePosition = -1
      // The snap will be automatically repaired on the second execution.
      this.fixSnapReset = true
    }
    this.bindSlidingEvent()
  }
}

export {
  ModalityEventTarget
}
