
import { Applet, ApplicationSafeAreaValue, GlobalCSSVariables } from '../../types'

export default (appletWindow: Window, applet: Applet): void => {
  const { id, application } = applet
  const globalCSSVariablesConfig = application.config.globalCSSVariables
  const globalCSSVariables = typeof globalCSSVariablesConfig === 'function' ? globalCSSVariablesConfig() : globalCSSVariablesConfig
  const docStyle = appletWindow.document.documentElement.style
  const setGlobalCSSVariables = (variables: GlobalCSSVariables): void => {
    // clear snapshot
    applet.snapshot = null
    for (const key in variables) {
      docStyle.setProperty(key, variables[key])
    }
  }
  const setCSSSafeAreaValue = (data: ApplicationSafeAreaValue): void => {
    setGlobalCSSVariables({
      '--application-safe-area-top': data[0] ?? data,
      '--application-safe-area-right': data[1] ?? data,
      '--application-safe-area-bottom': data[2] ?? data[0] ?? data,
      '--application-safe-area-left': data[3] ?? data[1] ?? data
    })
  }
  const safeAreaConfig = application.config.safeArea
  const safeArea = typeof safeAreaConfig === 'function' ? safeAreaConfig() : safeAreaConfig
  if (safeArea) {
    setCSSSafeAreaValue(safeArea)
  }
  if (globalCSSVariables) {
    setGlobalCSSVariables(globalCSSVariables)
  }
  const safeAreaChange = (data: ApplicationSafeAreaValue): void => {
    setCSSSafeAreaValue(data)
  }
  const globalCSSVariablesChange = (data: GlobalCSSVariables): void => {
    setGlobalCSSVariables(data)
  }
  application.on('safeAreaChange', safeAreaChange, id)
  application.on('globalCSSVariablesChange', globalCSSVariablesChange, id)
}
