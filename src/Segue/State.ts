import { SegueHistory } from './History'
import { Applet } from '../types'

class SegueState extends SegueHistory {
  public hasAnimation = false
  public hasSuperSwitched = false
  public viewportLevelLength = 2
  public historyIndexOfStartOverlaying: number | undefined = undefined

  get isEntryApplet() {
    return !this.prevApplet || this.prevApplet.rel !== 'applet'
  }

  get immovable() {
    return this.hasSuperSwitched || !this.hasAnimation || this.countercurrent
  }

  get fallbackState(): 1 | -1 | 0 {
    if (this.appletGroup.length === 1) {
      return -1
    }
    if (!this.applet.config.free && this.prevApplet?.config.free) {
      return 1
    } else if (this.applet.config.free && !this.prevApplet?.config.free) {
      return 0
    }
    return this.stackUp ? 0 : 1
  }

  get stackUp(): boolean {
    return !(!this.applet.config.free && this.hasSuperSwitched) && this.applet.viewLevel >= (this.prevApplet?.viewLevel ?? 0)
  }

  get countercurrent(): boolean {
    return this.fallbackState === 1 || this.fromHistoryBack
  }

  get viewports(): [HTMLElement, HTMLElement] {
    return this.hasSuperSwitched ? [
      !this.applet.config.free ? this.relativeViewport : this.absoluteViewport,
      !this.prevApplet?.config.free ? this.relativeViewport : this.absoluteViewport
    ] : [
      this.applet.viewport as HTMLElement,
      this.prevApplet?.viewport as HTMLElement
    ]
  }

  get isInseparableLayer() {
    return !this.prevApplet || (this.prevApplet.rel === 'frameworks' && !this.prevApplet.slide)
  }

  public checkSwitchViewport(prevApplet: Applet | undefined = this.prevApplet, applet: Applet = this.applet): boolean {
    prevApplet = prevApplet || applet
    return !!applet.config.free !== !!prevApplet.config.free
  }

  public getSuperViewport(applet: Applet = this.applet): HTMLElement | ShadowRoot {
    return applet.rel === 'system' ? this.fixedViewport : !applet.config.free ? (this.relativeViewport.shadowRoot || this.relativeViewport) : (this.absoluteViewport.shadowRoot || this.absoluteViewport)
  }
}

export {
  SegueState
}
