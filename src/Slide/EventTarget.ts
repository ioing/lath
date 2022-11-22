import { SlideState } from './State'
import { setTimeout, testHasSmoothSnapScrolling } from '../lib/util'
import { SmoothScroller } from '../types'

export class SlideEventTarget extends SlideState {
  public scroller!: SmoothScroller
  public hasSmoothSnapScrolling = testHasSmoothSnapScrolling()
  private scrollCancelTimeoutId = -1
  private scrollCycleTimeout = 300 // !! > 200
  public closeOverlay(): void {
    this.slideViewOverlay.style.display = 'none'
  }
  public openOverlay(): void {
    this.slideViewOverlay.style.display = 'block'
  }
  public bindHolderEvent(): void {
    const cover = (e: TouchEvent) => {
      e.stopPropagation()
      this.openOverlay()
      this.slideView.style.overflowX = 'hidden'
    }
    const reset = () => {
      this.closeOverlay()
      this.slideView.style.overflowX = 'auto'
      // Not supported once
      /**
       * Obsolete
       * ------------- start -------------
       */
      this.slideView.removeEventListener('touchcancel', reset, true)
      this.slideView.removeEventListener('touchend', reset, true)
      /**
       * Obsolete
       * ------------- end -------------
       */
    }
    this.slideViewHolder.addEventListener('touchstart', cover, true)
    this.slideViewHolder.addEventListener('touchmove', cover, true)
    this.slideViewHolder.addEventListener('touchcancel', reset, true)
    this.slideViewHolder.addEventListener('touchend', reset, true)
  }
  public dispatchScrollEvent(): void {
    this.application.activate(false)
    this.applet.trigger('sliding', this.slidingState)
  }
  public bindScrollEvent(): void {
    const slideView = this.slideView
    slideView.addEventListener('scroll', () => {
      if (this.switching) return
      if (!this.scrolling) {
        this.freezeAll()
        this.scrolling = true
      }
      this.dispatchScrollEvent()
      clearTimeout(this.scrollCancelTimeoutId)
      this.scrollCancelTimeoutId = setTimeout(async () => {
        // for ios < 10.2
        if (!this.hasSmoothSnapScrolling) {
          await this.scroller.scrollTo(this.slidingState.xIndex * this.slideView.offsetWidth, this.slidingState.yIndex * slideView.offsetHeight)
        }
        this.scrolling = false
        this.activate(this.index)
        this.application.activate(true)
      }, this.scrollCycleTimeout) as unknown as number
    })
  }
  public async destroy(index: number): Promise<boolean> {
    const id = this.getAppletIdByIndex(index)
    if (!id) return Promise.resolve(true)
    const applet = this.application.applets[id]
    if (!applet) return Promise.resolve(true)
    if (applet.config.background !== false) return Promise.resolve(false)
    return applet.destroy(true)
  }
  public async freeze(index: number): Promise<void> {
    const id = this.getAppletIdByIndex(index)
    if (!id) return Promise.resolve()
    return this.application.get(id).then(applet => {
      applet.hide()
      this.applet.trigger('slideOut', applet)
    })
  }
  public async activate(index: number): Promise<void> {
    const id = this.getAppletIdByIndex(index)
    if (!id) return Promise.resolve()
    return this.application.get(id).then(async applet => {
      applet.show()
      this.applet.trigger('slideEnter', applet)
      if (id !== this.activeId) {
        this.destroy(this.getAppletIndexById(this.activeId))
      }
      this.activeId = id
      if (applet.view && applet.visibility) {
        return Promise.resolve()
      }
      return applet.build()
    })
  }
  public freezeAll() {
    const length = this.slideViewApplets.length
    for (let i = 0; i <= length; i++) {
      this.freeze(i)
    }
  }
  public async to(id: number | string, smooth = true): Promise<void> {
    const index = this.getAppletIndexById(id)
    const slideView = this.slideView
    let toX = 0
    let toY = 0
    if (this.options.slideViewSnapType === 'x') {
      const width = slideView.offsetWidth
      const borderEndX = width * this.slideViewApplets.length
      toX = Math.min(Math.max(index * width, 0), borderEndX)
    } else {
      const height = slideView.offsetHeight
      const borderEndY = height * this.slideViewApplets.length
      toY = Math.min(Math.max(index * height, 0), borderEndY)
    }
    if (this.index !== index) {
      await this.freeze(this.index)
    }
    if (smooth === false) {
      slideView.style.scrollBehavior = 'auto'
      slideView.scrollLeft = toX
      slideView.scrollTop = toY
      slideView.style.scrollBehavior = 'smooth'
      return Promise.resolve()
    }
    this.switching = true
    this.openOverlay()
    this.application.activate(false)
    return this.scroller.snapTo(toX, toY).then(() => {
      this.closeOverlay()
      this.switching = false
      this.activate(this.index)
      this.application.activate(true)
    })
  }
}
