import { SlideEventTarget } from './EventTarget'
import { SmoothScroller } from "../Scroll"
import { requestIdleCallback, testHasScrolling } from '../lib/util'
import { viewportCSSText, slideBaseCSSText, getSlideViewCSSText, slideViewHolderCSSText, slideViewOverlayCSSText } from './cssText'
import { Applet, SlideViewApplets, SlideViewSnapType } from "../types"

interface SlideViewOptions {
  slideViewSnapType: SlideViewSnapType
  openSlideViewLeftHolder?: boolean
  slideViewGridRepeat?: number
}

export class SlideView extends SlideEventTarget {
  public slideViewApplets!: SlideViewApplets
  public scroller!: SmoothScroller
  public scrolling = false
  public switching = false
  public distance = 0
  public activeId = ''
  constructor(applet: Applet, options: SlideViewOptions, target: HTMLElement) {
    super(applet, options, target)
    this.createSlideView(this.slideViewApplets, target)
    this.bindScrollEvent()
    this.bindHolderEvent()
    this.scroller = new SmoothScroller(this.slideView)
  }
  public resetViewportStyle(viewport: HTMLElement): void {
    viewport.style.cssText = viewportCSSText
  }
  public createSlideView(slideViewApplets: SlideViewApplets, target: HTMLElement): void {
    const slideView = document.createElement('slideView-viewport')
    const slideViewBaseStyle = document.createElement('style')
    const slideViewHolder = document.createElement('slideView-holder')
    const slideViewOverlay = document.createElement('slideView-overlay')
    const snapType = this.snapType
    const slideViewGridRepeat = this.options.slideViewGridRepeat ?? 2
    slideViewBaseStyle.innerHTML = slideBaseCSSText
    // important: z-index
    // multiple view，slide default overlay
    slideView.style.cssText = getSlideViewCSSText(snapType, slideViewGridRepeat, this.hasSmoothSnapScrolling)
    /**
     * Obsolete
     * ------------- start -------------
     */
    // ios < 12.55 bug
    if (testHasScrolling() === false) {
      slideView.style.cssText += '-webkit-overflow-scrolling: touch;'
    }
    /**
     * Obsolete
     * ------------- end -------------
     */
    slideViewHolder.style.cssText = slideViewHolderCSSText
    slideViewOverlay.style.cssText = slideViewOverlayCSSText
    slideViewOverlay.addEventListener('touchstart', (event) => {
      event.stopPropagation()
      event.preventDefault()
    }, true)
    // Redundant protection
    slideViewOverlay.addEventListener('touchend', () => {
      this.closeOverlay()
    }, true)
    slideViewApplets.forEach((applet, index) => {
      const { id, activate } = applet
      const viewport = document.createElement('applet-viewport')
      viewport.id = 'applet-viewport-' + id
      this.resetViewportStyle(viewport)
      if (index === 0) {
        this.activeId = id
        if (this.options.openSlideViewLeftHolder) {
          viewport.appendChild(slideViewHolder)
        }
      }
      slideView.appendChild(viewport)
      this.application.get(id).then((applet) => {
        applet.attach(viewport, this.applet, {
          agentSegue: async () => {
            return this.application.to(this.applet.id).then(() => {
              this.applet.slide?.to(id)
            })
          },
          noSwipeModel: true
        })
        if (activate === 'instant' || index === 0) {
          applet.build()
          if (index === 0) {
            applet.show()
          }
        } else if (activate === 'lazy') {
          requestIdleCallback(() => {
            applet.build()
          }, { timeout: 3000 })
        }
      })
    })
    target.appendChild(slideViewBaseStyle)
    target.appendChild(slideView)
    target.appendChild(slideViewOverlay)
    this.slideView = slideView
    this.slideViewHolder = slideViewHolder
    this.slideViewOverlay = slideViewOverlay
  }
}
