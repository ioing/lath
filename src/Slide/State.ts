import { SlideBase } from './Base'
import { SlidingState } from '../types'
export class SlideState extends SlideBase {
  private slidingStateCatch?: SlidingState
  get index() {
    const slideView = this.slideView
    const x = Math.round(slideView.scrollLeft / slideView.offsetWidth) + 1
    const y = Math.round(slideView.scrollTop / slideView.offsetHeight) + 1
    return x * y - 1
  }
  get slidingState(): SlidingState {
    if (this.slidingStateCatch) return this.slidingStateCatch
    const slideView = this.slideView
    return this.slidingStateCatch = {
      get x() {
        return slideView.scrollLeft
      },
      get y() {
        return slideView.scrollTop
      },
      get xIndex() {
        return Math.round(slideView.scrollLeft / slideView.offsetWidth)
      },
      get yIndex() {
        return Math.round(slideView.scrollTop / slideView.offsetHeight)
      }
    }
  }
  public getAppletIdByIndex(index: number) {
    return this.slideViewApplets[index]?.id
  }
  public getAppletIndexById(id: string | number): number {
    if (typeof id === 'number') return id
    let index = 0
    const slideViewApplets = this.slideViewApplets
    for (const applet of slideViewApplets) {
      if (applet.id === id) {
        return index
      }
      index++
    }
    return 0
  }
}
