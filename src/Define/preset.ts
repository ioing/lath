import { DefineApplet } from '../types'

interface PresetConst {
  root?: ShadowRoot
  appletsDefinition: {
    [key: string]: DefineApplet
  }
  appletsSlot: {
    [key: string]: HTMLSlotElement
  }
  appletsSpace?: HTMLElement
  defaultApplet: string
  awaitCallback?: () => void
  awaitDefine: () => Promise<void>
  __EXISTING__: boolean
}

const Preset: PresetConst = {
  appletsDefinition: {},
  appletsSlot: {},
  defaultApplet: 'home',
  awaitDefine: () => new Promise((resolve) => Preset.awaitCallback = resolve),
  __EXISTING__: false
}

export default Preset