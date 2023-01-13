import { Applet } from '../Applet/index'
import { EventProvider } from '../Event'
import { AppletManifest, Segue, FrameworksAppletConfig, PresetConfig, PresetApplets } from '../types'

type ApplicationOptions = Pick<Required<PresetConfig>, 'applets'>

class ApplicationBase extends EventProvider {
  public segue!: Segue
  public to!: Segue['to']
  public applets: { [key: string]: Applet } = {}
  public residentApplets: Array<string> = []
  public presetAppletsView: PresetApplets = {}
  public config!: FrameworksAppletConfig
  public readonly historyNodeLocation: number = history.length
  protected routerRegExp = /([^#/]+)(.+)?/
  protected options!: ApplicationOptions
  protected resolveURL(url: string): URL {
    const link = new URL(
      url,
      window.location.toString()
    )
    const linkObject = link
    if (link.href === undefined) {
      linkObject.href = String(link)
    }
    return linkObject
  }
  protected verifyAppletSrcLegitimacy(url: string): boolean {
    const capture = this.config.capture
    if (capture) return this.captureAppletSrc(url, capture)
    const allowHosts = this.config.allowHosts || []
    if (allowHosts.length === 0) {
      return true
    }
    allowHosts.push(location.host)
    const link = new URL(
      decodeURIComponent(url),
      window.location.toString()
    )
    const linkHost = link.host
    for (const host of allowHosts) {
      if (linkHost === host) return true
    }
    return false
  }
  protected captureAppletSrc(url: string, capture = this.config.capture): boolean {
    const resolve = this.resolveURL(url)
    const path = resolve.origin + resolve.pathname
    if (typeof capture === 'string') {
      if (capture === path) return true
    } else if (typeof capture === 'function') {
      if (capture(resolve, url)) return true
    }
    return false
  }
  protected promiseApplet(promise: () => Promise<AppletManifest>): Promise<AppletManifest> {
    return Promise.resolve(promise())
  }
  public checkIsPresetAppletsView(id: string) {
    return this.residentApplets.includes(id)
  }
  public delPresetAppletsView(id: string, remove = false) {
    if (remove && !this.checkIsPresetAppletsView(id)) {
      const preset = this.presetAppletsView[id]
      if (preset && preset.parentElement) {
        preset.parentElement.removeChild(preset)
      }
    }
    delete this.presetAppletsView[id]
  }
  public setPrestAppletsView(presetApplets: PresetApplets) {
    this.residentApplets = Object.keys(presetApplets)
    this.presetAppletsView = presetApplets
  }
  public setting(options: ApplicationOptions): void {
    this.options = options
  }
}

export {
  ApplicationBase
}
