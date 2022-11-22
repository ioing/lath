import { Applet, Application, SmoothScroller } from '../types'

export class AppletControlsBase {
  public applet: Applet
  public application: Application
  public scroll!: SmoothScroller
  public controlsView!: HTMLElement
  public controlsOverlay!: HTMLElement
  public contentContainer!: HTMLElement
  public backdropView!: HTMLElement
  public backdropReducedScale = 0.03
  public appletViewport: HTMLElement
  constructor(applet: Applet) {
    this.applet = applet
    this.application = applet.application
    this.appletViewport = this.applet.viewport as HTMLElement
  }
}
