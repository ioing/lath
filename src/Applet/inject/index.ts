import openWindow from './openWindow'
import { smartSetTimeout } from './smartSetTimeout'
import tapHighlight from './tapHighlight'
import cssVar from './cssVar'
import { Applet } from '../../types'

export const injectContext = (appletWindow: Window, applet: Applet): void => {
  const { config } = applet
  const apply = Array.from(new Set(config.apply))
  for (const item of apply) {
    switch (item) {
      case 'smart-setTimeout':
        smartSetTimeout(appletWindow)
        break
      default:
        break
    }
  }
  if (typeof config.inject === 'function') {
    try {
      config.inject(appletWindow, applet)
    } catch (error) {
      console.error('config > inject:', error)
    }
  }
}

export const injectDocument = (appletWindow: Window, applet: Applet): void => {
  const { config, application } = applet
  const apply = Array.from(new Set(config.apply))
  const param = config.applyOptions || {}
  for (const item of apply) {
    switch (item) {
      case 'proxy-link':
        openWindow(appletWindow, application)
        break
      case 'tap-highlight':
        tapHighlight(appletWindow, (param[item]?.selector ?? 'use-tap-highlight') as string)
        break
      default:
        break
    }
  }
  if (typeof config.injectToDocument === 'function') {
    try {
      config.injectToDocument(appletWindow, applet)
    } catch (error) {
      console.error('config > inject:', error)
    }
  }
  if (applet.components) {
    for (const mountComponent of applet.components) {
      appletWindow.customElements.define('code-highlight', mountComponent(appletWindow))
    }
  }
  cssVar(appletWindow, applet)
}

export const injectDocumentOverwrite = (appletWindow: Window, applet: Applet): void => {
  const { config, application } = applet
  const apply = Array.from(new Set(config.apply))
  for (const item of apply) {
    switch (item) {
      case 'proxy-link':
        openWindow(appletWindow, application)
        break
      default:
        break
    }
  }
  cssVar(appletWindow, applet)
}
