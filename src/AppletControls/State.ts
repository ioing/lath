import { AppletControlsBase } from './Base'

export class AppletControlsState extends AppletControlsBase {
  public fromViewports?: Array<HTMLElement>
  public advanceDegree = 0
  public swipeTransitionType = this.application.config.swipeTransitionType
  get visibility(): boolean {
    return Math.round(this.controlsView.scrollLeft / this.appletViewport.offsetWidth) === 0 ? false : true
  }
  get viewports(): HTMLElement[] {
    if (this.fromViewports) {
      return this.fromViewports
    }
    return this.fromViewports = this.application.segue.viewports
  }
  get degree(): number {
    return this.controlsView.scrollLeft / this.appletViewport.offsetWidth
  }
  get activity(): boolean {
    return this.application.activityApplet === this.applet
  }
  public clearFromViewports(): void {
    this.fromViewports = undefined
  }
}
