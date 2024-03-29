import { Applet, Application, SheetOptions, SmoothScroller } from '../types'
class ModalityBase {
  public applet: Applet
  public application: Application
  protected scroller!: SmoothScroller
  protected switching = false
  protected scrolling = false
  protected maxDegreeCache?: number
  public backdropReducedScale = 0.1
  public backdropRotateX = -10
  public backdropPerspective = 3000
  public backdropBorderRadius = 20
  public advanceDegree = 800 / window.innerHeight * 0.03
  public options?: SheetOptions
  public modalityContainer: HTMLElement
  public contentContainer!: HTMLElement
  public miniCard?: HTMLElement
  public defaultToLarge?: boolean
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
    this.defaultToLarge = this.options?.defaultCardSize === 'large'
  }
}

export {
  ModalityBase
}
