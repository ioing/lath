import Preset from './preset'
import { USE_SHADOW_DOM } from './env'
import { buildAppletSlot } from './slot'
import typeError from '../lib/typeError'
export class DefineApplication extends HTMLElement {
  private contentShadowRoot!: ShadowRoot
  constructor() {
    super()
  }
  static get observedAttributes() {
    return ['default-applet']
  }
  private init() {
    if (this.contentShadowRoot) return
    /**
     * Obsolete
     * ------------- start -------------
     */
    if (USE_SHADOW_DOM) {
      this.contentShadowRoot = this.attachShadow?.({ mode: 'closed' })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.contentShadowRoot = this as any
    }
    /**
     * Obsolete
     * ------------- end -------------
     */
    this.contentShadowRoot.appendChild(buildAppletSlot('system'))
    this.contentShadowRoot.appendChild(buildAppletSlot('frameworks'))
    Preset.root = this.contentShadowRoot
    Preset.appletsSpace = this
  }
  private get defaultApplet() {
    return this.getAttribute('default-applet')
  }
  private defineApplet() {
    if (!this.defaultApplet) return
    this.init()
    this.setupDefaultApplet(this.defaultApplet ?? 'home')
  }
  setupDefaultApplet(name: string) {
    this.contentShadowRoot.appendChild(buildAppletSlot(name))
    Preset.defaultApplet = name
    Preset.awaitCallback?.()
  }
  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (name === 'default-applet' && newValue) {
      if (oldValue && oldValue !== newValue) {
        typeError(1004)
        return
      }
      // some exception callbacks
      this.defineApplet?.()
    }
  }
  connectedCallback(): void {
    this.defineApplet()
  }
}