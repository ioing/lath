import Preset from './preset'

export const buildAppletSlot = (name: string) => {
  if (Preset.appletsSlot[name]) {
    return Preset.appletsSlot[name]
  }
  const appletSlot = document.createElement('slot')
  appletSlot.name = 'applet-' + name
  Preset.appletsSlot[name] = appletSlot
  return appletSlot
}
