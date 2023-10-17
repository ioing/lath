import Preset from './preset'
import { AppletAllTypeSettings, PresetConfig, Application } from '../types'
import typeError from '../lib/typeError'
import autoScrollPolyfill from '../Scroll/polyfill'
import loadWebAnimations from '../lib/webAnimations/load'
import { initApplication } from './init'

import('..').catch((e) => {
  console.warn(e)
})
autoScrollPolyfill()
loadWebAnimations()

export * from './env'
export const destroyApplication = () => {
  if (!Preset.appletsSpace) return
  const appletsSpace = Preset.appletsSpace
  const parentElement = appletsSpace.parentElement
  const wrapper = document.createElement('div')
  parentElement?.insertBefore(wrapper, appletsSpace)
  const childLength = appletsSpace.children.length
  for (let i = 0; i <= childLength; i++) {
    wrapper.appendChild(appletsSpace.children[i])
  }
}

export const createApplication = async (options: Partial<PresetConfig> = { tunneling: false }): Promise<Application> => {
  initApplication()
  /**
   * Obsolete
   */
  await autoScrollPolyfill()
  await loadWebAnimations()
  if (Preset.__EXISTING__) return Promise.reject('repeat')
  if (options.tunneling && !!window.__LATH_APPLICATION_AVAILABILITY__) return Promise.reject('tunneling')
  Preset.__EXISTING__ = true
  let Application
  try {
    ({ Application } = await import('..'))
  } catch (error) {
    console.warn(error)
    return Promise.reject(error)
  }
  const { tunneling = false, zIndex = undefined, applets = {} as Required<PresetConfig>['applets'] } = options
  if (!Preset.root) {
    setTimeout(() => {
      if (!Preset.root) {
        typeError(1005, 'return')
      }
    }, 5000)
    await Preset.awaitDefine()
  }
  const { root, defaultApplet, appletsSpace } = Preset
  if (!root) {
    return Promise.reject(typeError(1005, 'return'))
  }
  const application = new Application({ root, tunneling, zIndex, appletsSpace })
  const index = applets?.frameworks?.config?.index
  if (!Preset.appletsDefinition[defaultApplet]) {
    return Promise.reject(typeError(1006, 'return'))
  }
  if (!applets.frameworks) {
    applets.frameworks = {
      config: {
        level: 0,
        index: defaultApplet,
        singleFlow: false,
        singleLock: false,
        animation: 'slide',
        transientTimeout: 1800000,
        disableTransient: true
      }
    }
    if (!applets[defaultApplet]) {
      applets[defaultApplet] = {
        config: {
          level: 1,
          title: document.title,
          free: false,
          animation: 'slide',
          background: true
        }
      } as AppletAllTypeSettings
    }
  }
  if (index && !applets[index]) {
    applets[index] = {
      config: {
        level: 1,
        title: document.title,
        free: false,
        animation: 'slide',
        background: true
      }
    } as AppletAllTypeSettings
  }
  for (const name in Preset.appletsDefinition) {
    if (!applets[name]) {
      applets[name] = {
        config: {
          level: 1,
          title: document.title,
          free: false,
          animation: 'slide',
          background: true
        }
      } as AppletAllTypeSettings
    }
  }
  application.setting({
    applets
  })

  await application.start()
  application.setPrestAppletsView(Preset.appletsDefinition)
  return Promise.resolve(application)
}
