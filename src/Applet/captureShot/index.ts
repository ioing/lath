import { Applet } from '../../types'
import html2canvas from 'html2canvas'

export const capture = async (applet: Applet) => {
  const appletView: HTMLElement = applet.sandbox && applet.sameOrigin
    ? applet.contentWindow.document.documentElement
    : applet.view as HTMLElement
  const viewport = applet.viewport
  if (!viewport) {
    throw ('Capture Shot: The applet has not been initialized!')
  }
  const viewportWidth = viewport.offsetWidth
  const viewportHeight = viewport.offsetHeight

  /**
   * If it is a shadow view type, take a screenshot by cloning.
   * The aim is to reduce complexity and prevent interference.
   * HTML2canvas will cause the slot to be lost.
   */
  const { application } = applet
  const ignoreAttrName = 'data-html2canvas-ignore'
  let cloneAppletView: HTMLElement | undefined
  let shotWrapper: HTMLElement | undefined
  if (applet.view === appletView) {
    cloneAppletView = appletView.cloneNode(true) as HTMLElement
    application.appletsSpace.setAttribute(ignoreAttrName, 'true')
    shotWrapper = document.createElement('div')
    shotWrapper.style.opacity = '0'
    shotWrapper.style.contain = 'strict'
    shotWrapper.appendChild(cloneAppletView)
    document.body.appendChild(shotWrapper)
  }

  const canvas = await html2canvas(cloneAppletView || appletView, {
    backgroundColor: applet.color,
    useCORS: true,
    width: viewportWidth,
    height: viewportHeight,
    windowWidth: viewportWidth,
    windowHeight: viewportHeight,
    x: appletView.scrollLeft,
    y: appletView.scrollTop,
    removeContainer: true,
    imageTimeout: 2000
  })
  canvas.style.cssText = `
    width: 100% !important;
    height: auto !important;
    transition: all .4s ease;
  `
  /**
   * Clear clone node.
   */
  if (shotWrapper) {
    document.body.removeChild(shotWrapper)
    application.appletsSpace.removeAttribute(ignoreAttrName)
  }

  return canvas
}