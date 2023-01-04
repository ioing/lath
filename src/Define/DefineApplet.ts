import Preset from './preset'
import { USE_SHADOW_DOM } from './env'
import { buildAppletSlot } from './slot'
import testHasScrolling from '../lib/util/testHasScrolling'
import typeError from '../lib/typeError'

export class DefineApplet extends HTMLElement {
  constructor() {
    super()
  }
  public appletSlot!: HTMLSlotElement
  public getViewSlot() {
    return this.appletSlot
  }
  static get observedAttributes() {
    return ['applet-id', 'slot']
  }
  private get appletId() {
    return this.getAttribute('applet-id')
  }
  private defineApplet() {
    const id = this.appletId
    if (!id) return
    /**
     * Obsolete
     * ------------- start -------------
     */
    // old; ios < 9
    if (USE_SHADOW_DOM) {
      this.slot = 'applet-' + id
      this.appletSlot = buildAppletSlot(id)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.appletSlot = this as any
    }
    /**
     * Obsolete
     * ------------- end -------------
     */

    Preset.appletsDefinition[id] = this
  }
  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (name === 'applet-id' && newValue) {
      // ${id}-obsolete
      if (oldValue && newValue.split('-')[0] !== oldValue.split('-')[0]) {
        typeError(1002)
        typeError(1003, 'warn')
        return
      }
      // some exception callbacks
      this.defineApplet?.()
    }
  }
  connectedCallback(): void {
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
