import { ModalityBase } from './Base'

/**
 * Obsolete
 * ------------- end -------------
 */
class ModalityState extends ModalityBase {
  /**
   * Gets the view of the two switched windows during a transition.
   * The value should be cached because it needs to be returned from the state.
   * If the previous view was a modal box, you need to replace it with the previous non-modal box view.
   */
  get viewports() {
    if (this.fromViewports && this.activity) {
      return this.fromViewports
    }
    this.fromViewports = this.application.segue.viewports
    this.updateOverlapViewport()
    return this.fromViewports
  }
  get maxDegree() {
    if (this.maxDegreeCache) return this.maxDegreeCache
    const miniCardHeight = this.miniCard?.offsetHeight ?? 0
    return this.maxDegreeCache = 1 + miniCardHeight / this.contentContainer.offsetHeight
  }
  get degree() {
    return this.modalityContainer.scrollTop / Math.min(this.contentContainer.offsetHeight + (this.miniCard?.offsetHeight ?? 0), this.modalityContainer.offsetHeight)
  }
  get visibility(): boolean {
    return this.degree <= 0.1 ? false : true
  }
  get hasMiniCard(): boolean {
    return !!this.miniCard
  }
  get prevViewport(): HTMLElement {
    return this.viewports[1]
  }
  get activity(): boolean {
    return this.applet.transforming || this.application.activityApplet === this.applet
  }
  public checkScrollStop(): Promise<boolean> {
    return new Promise((resolve) => {
      const waitScrollEnd = (callback: () => void) => {
        setTimeout(() => this.scrolling ? waitScrollEnd(callback) : callback(), 100)
      }
      waitScrollEnd(() => resolve(true))
    })
  }
  public setBackdropViewport(viewport: HTMLElement): void {
    if (!this.fromViewports) {
      this.fromViewports = this.viewports
    }
    this.fromViewports[1] = viewport
  }
  private updateOverlapViewport(): void {
    const prevActivityApplet = this.application.prevActivityApplet
    if (prevActivityApplet?.modality) {
      this.setBackdropViewport(prevActivityApplet.modality.viewports[1])
    }
  }
}

export {
  ModalityState
}
