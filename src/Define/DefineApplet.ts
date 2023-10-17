import Preset from './preset'
import { getEnv } from './env'
import { buildAppletSlot } from './slot'
import testHasScrolling from '../lib/util/testHasScrolling'
import typeError from '../lib/typeError'

export class DefineApplet extends HTMLElement {
  constructor() {
    super()
  }
  private installed = false
  public appletSlot!: HTMLSlotElement
  public getViewSlot() {
    return this.appletSlot
  }
  static get observedAttributes() {
    return ['applet-id']
  }
  private get appletId() {
    return this.getAttribute('applet-id')
  }
  private defineApplet() {
    const id = this.appletId
    const { USE_SHADOW_DOM } = getEnv()
    if (!id) return
    /**
     * Obsolete
     * ------------- start -------------
     */
    // old; ios < 9
    if (!USE_SHADOW_DOM) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Preset.appletsSlot[id] = this.appletSlot = this as any
      Preset.appletsDefinition[id] = this
      return
    }
    /**
     * Obsolete
     * ------------- end -------------
     */

    this.slot = 'applet-' + id
    this.appletSlot = buildAppletSlot(id)
    Preset.appletsDefinition[id] = this
  }
  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (name === 'applet-id' && newValue) {
      // ${id}-obsolete
      if (oldValue && newValue.split('-')[0] !== oldValue.split('-')[0]) {
        typeError(1002, 'warn', `oldValue: ${oldValue}, newValue: ${newValue}`)
        typeError(1003, 'warn')
      }
      // some exception callbacks
      this.defineApplet?.()
    }
  }
  connectedCallback(): void {
    if (this.installed) return
    this.installed = true
    this.defineApplet()
    if (testHasScrolling() === false) {
      /**
       * Obsolete
       * ------------- start -------------
       */
      // ios < 12.55 bug
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.style.webkitOverflowScrolling = 'touch'
      }, 0)
      /**
       * Obsolete
       * ------------- end -------------
       */
    }
  }
}
