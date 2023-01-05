import { EventProvider } from '../Event'
import { Sandbox } from '../Sandbox'
import manifestProcess from './manifestProcess'
import { DefineApplet, Slide, Modality, AppletControls, AppletEvents, AppletAllConfig, AppletResources, AppletManifest, AppletAttachBehavior, Application, Applet } from '../types'

class AppletBase extends EventProvider {
  public id: string
  public param = ''
  public application: Application
  public viewport?: HTMLElement
  public mountBehavior?: AppletAttachBehavior
  public controls?: AppletControls
  public contentView?: DefineApplet
  public contentSlot?: HTMLSlotElement
  public parentApplet?: Applet
  public sandbox: Sandbox | undefined
  public slide: Slide | null = null
  public modality: Modality | null = null
  public view: HTMLElement | HTMLPortalElement | HTMLIFrameElement | null = null
  public img: HTMLElement | null = null
  public snapshot: HTMLCanvasElement | null = null
  public snapshotTime = -1
  public visitTime = -1
  public model: AppletManifest
  public events: AppletEvents = {
    transformStart: () => undefined,
    transformEnd: () => undefined,
    boot: () => undefined,
    load: () => undefined,
    loadError: () => undefined,
    preload: () => undefined,
    destroy: () => undefined
  }
  public darkTask: Array<() => void> = []
  public createTime = Date.now()
  public transient = false
  public config: AppletAllConfig = {
    title: '',
    level: 0,
    source: {},
    prerender: [],
    apply: [],
    background: 'auto',
    free: false
  }
  public components: ((w: Window) => CustomElementConstructor)[] = []
  public resources: AppletResources = {
    script: [],
    image: [],
    worker: [],
    video: [],
    audio: [],
    font: [],
    style: []
  }
  get self() {
    return this.application.applets[this.id] || this
  }
  constructor(id: string, model: AppletManifest, application: Application) {
    super()
    this.id = id
    this.model = model
    this.application = application

    const { config, resources, events, components } = this.setDefaultConfig(model, id)
    Object.assign(this.config, config)
    Object.assign(this.resources, resources)
    Object.assign(this.events, events)
    if (components) {
      this.components = components
    }
  }
  public setDefaultConfig = manifestProcess
}

export {
  AppletBase
}
