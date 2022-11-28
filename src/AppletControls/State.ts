import { AppletControlsBase } from './Base'

export class AppletControlsState extends AppletControlsBase {
  public degreeCache?: number
  public fromViewports?: Array<HTMLElement>
  public advanceDegree = 0
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
    if (this.degreeCache) return this.degreeCache
    return this.controlsView.scrollLeft / this.appletViewport.offsetWidth
  }
  get activity(): boolean {
    return this.application.activityApplet === this.applet
  }
  public clearDegreeCache() {
    this.degreeCache = undefined
  }
  public updateDegreeCache() {
    this.clearDegreeCache()
    this.degreeCache = this.degree
  }
  public clearFromViewports(): void {
    this.fromViewports = undefined
  }
}
