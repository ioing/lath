import { ModalityEventTarget } from './EventTarget'
import { SmoothScroller } from "../Scroll"
import { setTimeout, testHasSmoothSnapScrolling, testHasScrolling, getCSSUnits } from '../lib/util'
import { fullscreenBaseCSSText } from '../lib/cssText/fullscreenBaseCSSText'
import { baseCSSText } from './cssText'
import { Applet } from '../types'

/**
 * Obsolete
 * ------------- start -------------
 */
// old; ios < 9
const NoSmoothSnapScrolling = testHasSmoothSnapScrolling() === false
const NoScrolling = testHasScrolling() === false
/**
 * Obsolete
 * ------------- end -------------
 */
class ModalityView extends ModalityEventTarget {
  private scrollingTimeoutId = -1
  constructor(applet: Applet) {
    super(applet)
    this.scroller = new SmoothScroller(this.modalityContainer as HTMLElement)
    this.buildModalityOverlay()
    applet.viewport?.appendChild(this.modalityContainer)
  }
  public buildModalityOverlay() {
    const modalityOverlay = document.createElement('modality-overlay')
    modalityOverlay.style.cssText = `
      position: fixed;
      ${fullscreenBaseCSSText}
      z-index: 9;
      display: none;
    `
    modalityOverlay.addEventListener('touchstart', (event) => {
      // Prevent interruptions due to Alert, etc., from not closing the applet properly.
      if (this.degree <= this.advanceDegree && this.activity) {
        this.hide()
      }
      event.stopPropagation()
      event.preventDefault()
    }, true)
    this.modalityOverlay = modalityOverlay
  }
  public slide(degree: number, maxDegree: number, prevViewport: HTMLElement) {
    const options = this.options
    const darkness = options?.maskOpacity ?? 0.3
    const useFade = options?.useFade
    if (degree > maxDegree) {
      requestAnimationFrame(() => {
        this.modalityContainer.style.background = `rgba(0, 0, 0, ${darkness + (1 - darkness) * (degree - maxDegree) / 0.2})`
      })
      return
    }
    // if miniCard.
    const relativeDegree = this.miniCard ? (degree - 1) / (maxDegree - 1) : degree
    // stillBackdrop
    const stillBackdrop = this.options?.stillBackdrop || (this.miniCard && degree <= 1)
    requestAnimationFrame(() => {
      if (prevViewport && !stillBackdrop) {
        prevViewport.style.borderRadius = `${Math.min(relativeDegree, 1) * this.backdropBorderRadius}px`
        prevViewport.style.transform = `
        translate3d(0, ${relativeDegree * 10}px, -100px) 
        perspective(${this.backdropPerspective}px) 
        rotateX(${relativeDegree * this.backdropRotateX}deg) 
        scale(${1 - Math.max(relativeDegree * this.backdropReducedScale, 0)})
      `
      }
      this.modalityContainer.style.background = `rgba(0, 0, 0, ${darkness * Math.min(degree, 1)})`
      if (useFade) {
        this.contentContainer.style.opacity = `${relativeDegree - ((1 - relativeDegree) * 2)}`
      }
    })

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
    const scrollHandle = (): void => {
      this.slide(this.degree, this.maxDegree, this.prevViewport)
    }

    if (this.options?.swipeClosable !== false) {
      setTimeout(() => {
        this.bindDragContentEvent()
      }, 10)
    }
    modalityContainer.addEventListener('scroll', scrollHandle, false)

    if (options?.alwaysPopUp !== false) {
      this.applet.on('willShow', () => {
        if (this.applet.transforming) return
        this.rise()
      })
      this.applet.on('willHide', () => {
        if (this.applet.transforming) return
        this.fall()
      })
    }

    modalityContainer.appendChild(contentContainer)
    this.modalityPlaceholder = modalityPlaceholder
    return this.contentContainer = contentContainer
  }
}

export {
  ModalityView
}
