import { AppletControlsBase } from './Base'

export class AppletControlsState extends AppletControlsBase {
  public fromViewports?: Array<HTMLElement>
  public advanceDegree = 0
  get visibility(): boolean {
    return Math.round(this.controlsView.scrollLeft / this.appletViewport.offsetWidth) === 0 ? false : true
  }
  get viewports() {
    if (this.fromViewports) {
      return this.fromViewports
    }
    return this.fromViewports = this.application.segue.viewports
  }
  get degree() {
    return this.controlsView.scrollLeft / this.appletViewport.offsetWidth
  }
  public clearFromViewports() {
    this.fromViewports = undefined
  }
}
