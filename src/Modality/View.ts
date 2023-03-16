import { ModalityEventTarget } from './EventTarget'
import { SmoothScroller } from "../Scroll"
import { setTimeout, testHasScrolling, getCSSUnits } from '../lib/util'
import { getIOSversion } from '../lib/util/getIOSversion'
import { fullscreenBaseCSSText } from '../lib/cssText/fullscreenBaseCSSText'
import { baseCSSText } from './cssText'
import { Applet } from '../types'

/**
 * Obsolete
 * ------------- start -------------
 */
// old; ios < 9
const NoScrolling = testHasScrolling() === false
/**
 * Obsolete
 * ------------- end -------------
 */
class ModalityView extends ModalityEventTarget {
  constructor(applet: Applet) {
    super(applet)
    this.scroller = new SmoothScroller(this.modalityContainer as HTMLElement)
    this.buildModalityOverlay()
    applet.viewport?.appendChild(this.modalityContainer)
  }
  private buildModalityOverlay() {
    const modalityOverlay = document.createElement('modality-overlay')
    modalityOverlay.style.cssText = `
      position: fixed;
      ${fullscreenBaseCSSText}
      z-index: 9;
      display: none;
    `
    modalityOverlay.addEventListener('touchstart', (event) => {
      // Prevent interruptions due to Alert, etc., from not closing the applet properly.
      if (!this.options?.stillBackdrop && this.degree <= this.advanceDegree && this.activity) {
        this.hide()
      }
      event.stopPropagation()
      event.preventDefault()
    }, true)
    this.modalityOverlay = modalityOverlay
  }

  public create(): HTMLElement {
    const viewport = this.appletViewport
    const modalityContainer = this.modalityContainer
    const containerFirstChild = modalityContainer.firstChild
    const modalityPlaceholder = document.createElement('modality-placeholder')
    const modalityHandle = document.createElement('modality-handle')
    const blockedHolder = document.createElement('blocked-holder')
    const contentContainer = document.createElement('applet-container')
    const modalityStyle = document.createElement('style')
    const options = this.options
    const hasMiniCard = !!options?.miniCardHeight && !NoScrolling
    const miniCardHeight = getCSSUnits(options?.miniCardHeight) || '0px'
    const blockedHolderWidth = getCSSUnits(options?.blockedHolderWidth) || '40px'
    const top = getCSSUnits(options?.top) || '60px'
    const maskClosable = options?.maskClosable
    const noHandlebar = options?.noHandlebar
    const borderRadius = getCSSUnits(options?.borderRadius) || '16px'
    modalityStyle.innerHTML = baseCSSText
    contentContainer.style.cssText = `
      position: relative;
      border: 0px;
      outline: 0px;
      min-width: 100%;
      min-height: calc(100% - ${top});
      max-height: calc(100% - ${top});
      border-top-left-radius: ${borderRadius};
      border-top-right-radius: ${borderRadius};
      scroll-snap-align: start;
      scroll-snap-stop: always;
      overflow: hidden;
      transform: translate3d(0, 0, 500px);
    `
    viewport.appendChild(modalityStyle)
    viewport.appendChild(blockedHolder)
    viewport.appendChild(this.modalityOverlay)
    modalityPlaceholder.appendChild(modalityHandle)
    // set blockedHolder width
    blockedHolder.style.width = blockedHolderWidth
    if (containerFirstChild) {
      modalityContainer.insertBefore(modalityPlaceholder, containerFirstChild)
    } else {
      modalityContainer.appendChild(modalityPlaceholder)
    }
    /**
     * Obsolete
     * ------------- start -------------
     */
    // ios < 12.55 bug
    if (NoScrolling) {
      modalityContainer.style.cssText += '-webkit-overflow-scrolling: touch;'
    }
    /**
     * Obsolete
     * ------------- end -------------
     */
    if (hasMiniCard) {
      const miniCard = document.createElement('modality-mini-card')
      miniCard.style.cssText = `
        width: 100%;
        min-height: calc(100% - ${miniCardHeight});
        scroll-snap-align: start;
        scroll-snap-stop: always;
      `
      modalityContainer.appendChild(miniCard)
      modalityHandle.style.top = `calc(200% - ${miniCardHeight})`
      this.miniCard = miniCard
    }
    if (maskClosable !== false) {
      modalityPlaceholder.addEventListener('click', () => {
        this.hide()
      })
      this.miniCard?.addEventListener('click', () => {
        this.hide()
      })
    }
    if (noHandlebar) {
      modalityHandle.style.display = 'none'
    }

    if (this.options?.swipeClosable ?? getIOSversion()) {
      setTimeout(() => {
        this.bindDragContentEvent()
      }, 10)
    }
    this.bindBaseEvent()
    modalityContainer.appendChild(contentContainer)
    this.modalityPlaceholder = modalityPlaceholder
    return this.contentContainer = contentContainer
  }
}

export {
  ModalityView
}
