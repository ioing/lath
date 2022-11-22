import { AppletControlsEventTarget } from './EventTarget'
import { SmoothScroller } from '../Scroll'
import { testHasScrolling } from '../lib/util'
import { snapItemCSSText, sheetViewCSSText, backdropViewCSSText, controlsViewCSSText, controlsOverlayCSSText } from './cssText'

export class AppletControlsView extends AppletControlsEventTarget {
  public attach(): void {
    this.controlsView = document.createElement('applet-controls')
    this.contentContainer = document.createElement('applet-container')
    this.backdropView = document.createElement('applet-backdrop')
    this.controlsOverlay = document.createElement('applet-controls-overlay')
    this.scroll = new SmoothScroller(this.controlsView)
  }
  public buildControlsView(): void {
    // important: relative
    const snapItemStyle = snapItemCSSText
    const sheetViewStyle = document.createElement('style')
    sheetViewStyle.innerHTML = sheetViewCSSText
    this.contentContainer.style.cssText = snapItemStyle
    this.backdropView.style.cssText = backdropViewCSSText
    // important: relative
    this.controlsView.style.cssText = controlsViewCSSText
    /**
     * Obsolete
     * ------------- start -------------
     */
    // ios < 12.55 bug
    if (testHasScrolling() === false) {
      this.controlsView.style.cssText += '-webkit-overflow-scrolling: touch;'
    }
    /**
     * Obsolete
     * ------------- end -------------
     */
    this.controlsOverlay.style.cssText = controlsOverlayCSSText
    this.controlsView.appendChild(this.backdropView)
    this.controlsView.appendChild(this.contentContainer)
    this.appletViewport.appendChild(sheetViewStyle)
    this.appletViewport.appendChild(this.controlsView)
    this.appletViewport.appendChild(this.controlsOverlay)
  }
  public create(): HTMLElement {
    this.attach()
    this.buildControlsView()
    this.bindCoreEvent()
    const applet = this.applet
    if (applet.rel !== 'applet' || applet.swipeModel === false || applet.mountBehavior?.noSwipeModel) {
      this.freeze()
    }
    return this.contentContainer
  }
}
