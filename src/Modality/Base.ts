import { Applet, Application, SheetOptions, SmoothScroller } from '../types'

class ModalityBase {
  public applet: Applet
  public application: Application
  public scroller!: SmoothScroller
  public switching = false
  public scrolling = false
  public backdropReducedScale = 0.1
  public backdropRotateX = -10
  public backdropPerspective = 3000
  public backdropBorderRadius = 20
  public advanceDegree = 0.03
  public options?: SheetOptions
  public maxDegreeCache?: number
  public modalityContainer: HTMLElement
  public contentContainer!: HTMLElement
  public miniCard?: HTMLElement
  public appletViewport: HTMLElement
  public fromViewports?: Array<HTMLElement>
  public modalityOverlay!: HTMLElement
  public modalityPlaceholder!: HTMLElement
  constructor(applet: Applet) {
    this.applet = applet
    this.application = this.applet.application
    this.modalityContainer = document.createElement('modality-container')
    this.appletViewport = this.applet.viewport as HTMLElement
    this.options = this.applet.config.sheetOptions
  }
}

export {
  ModalityBase
}
