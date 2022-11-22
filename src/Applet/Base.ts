import { EventProvider } from '../Event'
import { Sandbox } from '../Sandbox'
import typeError from '../lib/typeError'
import getIOSversion from '../lib/util/getIOSVersion'
import { DefineApplet, Slide, Modality, AppletControls, AppletEvents, AppletAllConfig, AppletResources, AppletManifest, FrameworksAppletConfig, AppletAttachBehavior, Application, Applet } from '../types'

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
    apply: ['smart-setTimeout', 'proxy-link', 'tap-highlight'],
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
  public setDefaultConfig(manifest: AppletManifest, id: string): AppletManifest {
    const config = manifest.config
    if (id === 'frameworks' || id === 'system') {
      if (config.free) {
        typeError(1101, 'warn')
      }
      if (config.source?.html || config.source?.src) {
        typeError(1102, 'warn')
      }
    }
    if (config.portal) {
      if (!config.free) {
        typeError(1103, 'warn')
      }
    }
    if ((config.level ?? 0) > 10000) {
      typeError(1104, 'warn')
    }
    if (config?.unApply?.length) {
      const unApply = config.unApply
      this.config.apply = this.config.apply?.filter((item) => !unApply.includes(item))
    }
    if (config.modality?.indexOf('sheet') === 0) {
      if (config.animation) {
        typeError(1105, 'warn')
      }
      config.animation = 'popup'
    } else if (config.animation === 'popup') {
      config.modality = 'sheet'
      typeError(1106, 'warn')
    }
    if (config.modality?.indexOf('paper') === 0) {
      if (config.animation) {
        typeError(1105, 'warn')
      }
      const { maskOpacity, swipeClosable } = config.paperOptions || { maskOpacity: 0.5, swipeClosable: true }
      config.animation = 'stretch'
      config.sheetOptions = {
        stillBackdrop: true,
        noHandlebar: true,
        maskOpacity,
        swipeClosable,
        borderRadius: '0px',
        top: '0px'
      }
    } else if (config.modality?.indexOf('overlay') === 0) {
      if (config.animation) {
        typeError(1105, 'warn')
      }
      if (!config.color) {
        config.color = 'transparent'
      }
      const { maskOpacity, swipeClosable } = config.overlayOptions || { maskOpacity: 0.5, swipeClosable: false }
      config.animation = 'popup'
      config.sheetOptions = {
        stillBackdrop: true,
        noHandlebar: true,
        maskOpacity,
        swipeClosable,
        borderRadius: '0px',
        top: '0px',
        useFade: true
      }
    }
    // In scenes such as Tab, you should also close the left slide to exit when no animation is set, otherwise overlay layers will appear.
    if (!config.animation) {
      config.disableSwipeModel = true
    }
    if (!(config as FrameworksAppletConfig).swipeTransitionType) {
      (config as FrameworksAppletConfig).swipeTransitionType = (config as FrameworksAppletConfig).swipeTransitionType ?? (getIOSversion() ? 'slide' : 'zoom')
    }
    return manifest
  }
}

export {
  AppletBase
}
