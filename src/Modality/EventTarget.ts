import { ModalityState } from './State'
import { setTimeout } from '../lib/util'

class ModalityEventTarget extends ModalityState {
  private processPromise!: Promise<void>
  public async switchSheet(hideThresholdScale = 1.5): Promise<void> {
    if (!this.activity) return Promise.resolve()
    if (this.degree <= this.maxDegree / hideThresholdScale) {
      return this.hide()
    } else {
      return this.rise()
    }
  }
  public switchOverlay(open = false): void {
    this.modalityOverlay.style.display = open ? 'block' : 'none'
  }
  public switchSmooth(open = true): void {
    this.modalityContainer.style.scrollBehavior = open ? 'smooth' : 'auto'
  }
  public switchSnap(open = true): void {
    this.modalityContainer.style.scrollSnapType = open ? 'y mandatory' : 'none'
  }
  public switchBackdropColor(open = true): void {
    this.application.segue.applicationViewport.style.backgroundColor = open ? this.options?.backdropColor ?? '#000' : ''
  }
  public freezeSnap() {
    this.modalityPlaceholder.style.display = 'none'
    this.modalityContainer.scrollTop = 0
  }
  public activateSnap() {
    this.modalityPlaceholder.style.display = 'flex'
    this.switchSmooth(false)
    this.modalityContainer.scrollTop = this.modalityContainer.offsetHeight + (this.miniCard?.offsetHeight ?? 0)
    setTimeout(() => {
      this.switchSmooth(true)
    }, 0)
  }
  public async rise(): Promise<void> {
    if (this.switching) return this.processPromise
    this.switching = true
    this.switchOverlay(true)
    this.switchBackdropColor(true)
    const offsetTop = this.modalityContainer.offsetHeight + (this.miniCard ? (this.degree >= 1 + (this.maxDegree - 1) / 2 ? (this.miniCard?.offsetHeight ?? 0) : 0) : 0)
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
    return this.fall().then(async () => {
      if (this.activity) {
        await this.application.segue.back()
        this.switchBackdropColor(false)
        this.fromViewports = undefined
      }
    })
  }
  public bindDragContentEvent(): void {
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
      this.switchSheet(this.miniCard ? 2 : 1.25).then(() => {
        this.switchOverlay(false)
        this.switchSnap(true)
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
}

export {
  ModalityEventTarget
}
