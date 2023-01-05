import { requestAnimationFrame as rAF, testHasSmoothScrolling, testHasSmoothSnapScrolling, setTimeout } from '../lib/util'

interface StepOptions {
  startTime: number
  startX: number
  startY: number
  x: number
  y: number
  duration: number
  end: () => void
}

const now = window.performance && window.performance.now
  ? window.performance.now.bind(window.performance) : Date.now
const easeInOutCubic = (x: number): number => {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
const hasSmoothScrolling = testHasSmoothScrolling()
const hasSmoothSnapScrolling = testHasSmoothSnapScrolling()
/**
 * Obsolete
 * ------------- start -------------
 */
// safari pc
const breakSmoothSnap = !hasSmoothScrolling && /Mac OS X [0-9][0-9]_/g.exec(navigator.userAgent)
/**
 * Obsolete
 * ------------- end -------------
 */

class SmoothScroller {
  public element: HTMLElement
  private touchHold = false
  private scrollType: 'scroll' | 'snap' = 'scroll'
  private scrollHold: (() => void) | null = null
  private defaultScrollBehavior!: string
  private defaultScrollSnapType!: string
  private scrolling = false
  private preStep?: Array<number>
  private reservePlanId = -1
  private scrollDuration = 400
  constructor(element: HTMLElement, stoppable = false) {
    this.element = element
    if (!hasSmoothScrolling && stoppable) {
      element.addEventListener('touchstart', this.scrollStop, true)
      element.addEventListener('touchend', this.scrollContinue, true)
      element.addEventListener('touchcancel', this.scrollContinue, true)
    }
  }
  public async snapTo(x: number, y: number, duration?: number): Promise<void> {
    this.touchHold = false
    this.scrollType = 'snap'
    return this.smoothScroll(x, y, duration)
  }
  public async scrollTo(x: number, y: number, duration?: number): Promise<void> {
    this.touchHold = false
    this.scrollType = 'scroll'
    return this.smoothScroll(x, y, duration)
  }
  private scrollStop(): void {
    this.touchHold = true
  }
  private scrollContinue(): void {
    this.touchHold = false
    this.scrollHold?.()
  }
  private catchDefaultStyle(): void {
    if (this.scrolling === true) return
    const style = this.element.style
    this.defaultScrollBehavior = style.scrollBehavior || 'smooth'
  }
  private isBreak(): boolean {
    if ("ontouchend" in document) return false
    if (this.preStep !== undefined && (this.preStep[0] !== this.element.scrollLeft || this.preStep[1] !== this.element.scrollTop)) {
      this.scrollStop()
      return true
    }
    return false
  }
  private step(context: StepOptions): void {
    if (this.touchHold) {
      if (this.scrollType === 'scroll') {
        return context.end()
      } else {
        this.scrollHold = () => {
          this.step(context)
        }
      }
    }
    const time = now()
    // avoid elapsed times higher than one
    const elapsed = Math.min((time - context.startTime) / context.duration, 1)
    // apply easing to elapsed time
    const value = easeInOutCubic(elapsed)

    let currentX = context.startX + (context.x - context.startX) * value
    let currentY = context.startY + (context.y - context.startY) * value

    const directionX = context.x - context.startX > 0 ? 1 : -1
    const directionY = context.y - context.startY > 0 ? 1 : -1

    if (directionX === 1 && currentX > context.x) {
      currentX = context.x
    } else if (directionX === -1 && currentX < context.x) {
      currentX = context.x
    }

    if (directionY === 1 && currentY > context.y) {
      currentY = context.y
    } else if (directionY === -1 && currentY < context.y) {
      currentY = context.y
    }

    if (this.isBreak()) return

    /**
     * Obsolete
     * ------------- start -------------
     */
    // step.1 for ios < 10.2
    this.element.scrollLeft = currentX
    this.element.scrollTop = currentY
    /**
     * Obsolete
     * ------------- end -------------
     */
    // step.2 Note the order!
    this.element.scrollTo(currentX, currentY)

    this.preStep = [this.element.scrollLeft, this.element.scrollTop]

    // scroll more if we have not reached our destination
    if (currentX !== context.x || currentY !== context.y) {
      rAF(() => {
        this.step(context)
      })
    } else {
      context.end()
      this.scrollHold = null
    }
  }
  private openSmooth(): void {
    this.element.style.scrollBehavior = 'smooth'
    /**
     * Obsolete
     * ------------- start -------------
     */
    if (breakSmoothSnap) {
      this.element.style.scrollSnapType = this.defaultScrollSnapType
    }
    /**
     * Obsolete
     * ------------- end -------------
     */
  }
  private closeSmooth(): void {
    this.element.style.scrollBehavior = 'auto'
    /**
     * Obsolete
     * ------------- start -------------
     */
    if (breakSmoothSnap) {
      this.defaultScrollSnapType = this.element.style.scrollSnapType
      this.element.style.scrollSnapType = 'none'
    }
    /**
     * Obsolete
     * ------------- end -------------
     */
  }
  private beforeScrolling(): void {
    this.catchDefaultStyle()
    this.preStep = undefined
    this.scrolling = true
  }
  private endScrolling(): void {
    this.element.style.scrollBehavior = this.defaultScrollBehavior || 'smooth'
    this.scrolling = false
  }
  private checkScrollEnd = (x: number, y: number): boolean => {
    return this.element.scrollLeft === x && this.element.scrollTop === y
  }
  private smoothScroll(x: number, y: number, duration?: number): Promise<void> {
    if ((this.scrollType === 'scroll' && !hasSmoothScrolling) || (this.scrollType === 'snap' && !hasSmoothSnapScrolling)) {
      return this.smoothScrollByStep(x, y)
    }
    let scrollCycleTimeout = -1
    return new Promise((resolve) => {
      const scrollHandel = () => {
        clearTimeout(scrollCycleTimeout)
        scrollCycleTimeout = setTimeout(async () => {
          this.element.removeEventListener('scroll', scrollHandel, false)
          resolve()
        }, 100) as unknown as number
      }
      this.element.addEventListener('scroll', scrollHandel, false)
      this.beforeScrolling()
      this.openSmooth()
      if (this.checkScrollEnd(x, y)) {
        this.endScrolling()
        resolve()
      }
      this.element.scrollTo(x, y)

      clearTimeout(this.reservePlanId)
      // doesn't trigger scrolling
      this.reservePlanId = setTimeout(async () => {
        if (scrollCycleTimeout === -1) {
          await this.smoothScrollByStep(x, y, duration)
          resolve()
        }
      }, 600) as unknown as number
    })
  }
  private smoothScrollByStep(x: number, y: number, duration = this.scrollDuration): Promise<void> {
    this.beforeScrolling()
    this.closeSmooth()
    return new Promise(resolve => {
      this.step({
        startTime: now(),
        startX: this.element.scrollLeft,
        startY: this.element.scrollTop,
        x: x,
        y: y,
        duration,
        end: () => {
          this.endScrolling()
          resolve()
        }
      })
    })
  }
}

export {
  SmoothScroller
}