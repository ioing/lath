import { Applet, Application, SlideViewApplets, SlideViewSnapType } from "../types"

interface SlideViewOptions {
  slideViewSnapType: SlideViewSnapType
  openSlideViewLeftHolder?: boolean
  slideViewGridRepeat?: number
}

export class SlideBase {
  public slideView!: HTMLElement
  public slideViewHolder!: HTMLElement
  public applet!: Applet
  public slideViewApplets!: SlideViewApplets
  public slideViewOverlay!: HTMLElement
  public options!: SlideViewOptions
  public scrolling = false
  public switching = false
  public distance = 0
  public activeId = ''
  public application!: Application
  public snapType: SlideViewSnapType = 'x'
  constructor(applet: Applet, options: SlideViewOptions = { openSlideViewLeftHolder: true, slideViewSnapType: 'x', slideViewGridRepeat: 0 }, target = applet.viewport) {
    const slideViewApplets = applet.config.defaultSlideViewApplets
    if (!slideViewApplets || !target) return
    this.applet = applet
    this.application = applet.application
    this.slideViewApplets = slideViewApplets
    this.options = options
    this.snapType = options.slideViewSnapType
  }
}
