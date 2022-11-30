import { Application } from '../Application'
import { Applet } from '../applet'
import { fullscreenBaseCSSText } from '../lib/cssText/fullscreenBaseCSSText'
import { SegueOptions, SegueActionOrigin, PresetConfig } from '../types'

class SegueBase {
  public id = ''
  public prevId = ''
  public param = ''
  public root: HTMLElement | ShadowRoot
  public application: Application
  public zIndex: number
  public applet!: Applet
  public prevApplet?: Applet
  public appletGroup!: Array<Applet>
  public options!: SegueOptions
  public touches?: SegueActionOrigin
  public readonly relativeViewport: HTMLElement = document.createElement('relative-windows')
  public readonly absoluteViewport: HTMLElement = document.createElement('absolute-windows')
  public readonly fixedViewport: HTMLElement = document.createElement('fixed-windows')
  public readonly applicationViewport: HTMLElement = document.createElement('application-windows')
  public target: HTMLElement | ShadowRoot = this.relativeViewport

  constructor(app: Application, presetConfig: PresetConfig) {
    this.application = app
    this.root = presetConfig.root || document.body
    this.zIndex = presetConfig.zIndex || Number.MAX_SAFE_INTEGER
    this.setupViewport()
  }

  setupViewport(): void {
    this.relativeViewport.id = 'relative-viewport'
    this.absoluteViewport.id = 'absolute-viewport'
    this.resetViewport()
    this.fixedViewport.id = 'fixed-viewport'
    this.fixedViewport.style.cssText = `
      width: 100%;
      height: 0;
      max-height: 0;
      z-index: 3;
      overflow: hidden;
      contain: layout size;
    `
    this.applicationViewport.style.cssText = `
      position: fixed;
      ${fullscreenBaseCSSText}
      overflow: hidden;
      z-index: ${this.zIndex};
      contain: layout size;
    `
    this.applicationViewport.appendChild(this.relativeViewport)
    this.applicationViewport.appendChild(this.absoluteViewport)
    this.applicationViewport.appendChild(this.fixedViewport)
    this.root.appendChild(this.applicationViewport)
  }

  resetViewport(free?: boolean): void {
    const baseStyle = `
      position: fixed;
      ${fullscreenBaseCSSText}
      overflow: hidden;
      contain: layout size;
    `
    this.relativeViewport.style.cssText = `
      ${baseStyle}
      z-index: 1;
      ${free ? 'transform: translate3d(0, 0, 0);' : ''}
    `
    this.absoluteViewport.style.cssText = `
      ${baseStyle}
      z-index: 2;
      ${!free ? 'transform: translate(200%, 200%);' : ''}
    `
  }
}

export {
  SegueBase
}
