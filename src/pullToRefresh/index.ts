import { Applet } from '../types'
import { setTimeout } from '../lib/util'
import { setGlobalCSS, getBaseStyle, getHolderStyle, holdLayerStyle } from './cssText'

export const createPullToRefreshHolder = (darkTheme: boolean, target: HTMLElement) => {
  const holdLayer = document.createElement('applet-refresh-hold')
  const holderWrapper = document.createElement('applet-pull-refresh')
  const shadowroot = holderWrapper.attachShadow?.({ mode: 'open' })
  const holder = document.createElement('div')
  const spinnerWrapper = document.createElement('div')
  const spinner = document.createElement('div')
  const style = document.createElement('style')
  style.innerHTML = getBaseStyle(darkTheme)
  holder.style.cssText = getHolderStyle(darkTheme)
  holdLayer.style.cssText = holdLayerStyle
  shadowroot.appendChild(style)
  spinnerWrapper.className = 'applet-loading'
  spinnerWrapper.appendChild(spinner)
  spinner.className = 'applet-spinner'
  holder.appendChild(spinnerWrapper)
  shadowroot.appendChild(holder)
  target.appendChild(shadowroot)
  target.appendChild(holdLayer)
  setGlobalCSS()
  return {
    holder,
    spinner,
    holdLayer
  }
}

export const registerPullDownEvent = (applet: Applet, scroller: HTMLElement, holder: HTMLElement | null, spinner: HTMLElement | null, holdLayer: HTMLElement | null) => {
  if (!scroller || !holder || !spinner || !holdLayer) return
  const getTouchPos = (event: Event) => {
    const touchEvent = event as TouchEvent
    const changedTouches = touchEvent.changedTouches
    const touch = changedTouches[changedTouches.length - 1]
    return [touch.clientX, touch.clientY]
  }
  const active = {
    startY: 0,
    y: 0,
    scrollStartY: 0,
    hasTouchStart: false,
    triggered: false
  }
  scroller.addEventListener('touchstart', (e) => {
    if (active.triggered) return
    const isBody = scroller.tagName === 'BODY'
    const scrollTop = scroller?.scrollTop
    const scrollStartY = (isBody ? e.view?.scrollY : scrollTop) ?? scrollTop
    if (scrollStartY > 100) return
    holder.style.transitionDuration = '0s'
    active.scrollStartY = scrollStartY
    active.startY = getTouchPos(e)[1]
    active.hasTouchStart = true
  })
  scroller.addEventListener('touchend', () => {
    active.hasTouchStart = false
    spinner.style.filter = 'blur(0px)'
    holder.style.transitionDuration = '.4s'
    if (!active.triggered) {
      holder.style.transform = `translate3d(0, -100%, 0)`
      applet.trigger('pullToRefreshCancel')
      return
    }
    spinner.style.animation = 'applet-spinner 1000ms infinite linear'
    holdLayer.style.display = 'block'
    setTimeout(() => {
      holder.style.transform = `translate3d(0, -100%, 0)`
      setTimeout(() => {
        if (applet.config.forcedToRefresh) {
          return location.reload()
        }
        applet.refresh().then(() => {
          holdLayer.style.display = 'none'
          spinner.style.animation = 'none'
          active.triggered = false
        }).catch(() => {
          location.reload()
        })
      }, 400)
    }, 800)
    applet.trigger('pullToRefreshRelease')
  })
  scroller.addEventListener('touchmove', (e) => {
    if (active.hasTouchStart === false || active.scrollStartY > 100) return
    const pos = getTouchPos(e)
    const [x, y] = pos
    active.y = y - active.startY
    if (active.y < 10) return
    if (active.y < active.scrollStartY + 50) return
    const scrollWidth = scroller.offsetWidth
    const movePercentX = Math.max(Math.min(x / scrollWidth * 100, 100), 0)
    const retardMovePercentX = 50 - (50 - movePercentX) / 3
    const movePercentY = Math.max(Math.min(active.y / 300 * 100, 100), 0)
    const retardMovePercentY = movePercentY * .5
    requestAnimationFrame(() => {
      holder.style.borderBottomLeftRadius = retardMovePercentX + '%'
      holder.style.borderBottomRightRadius = (100 - retardMovePercentX) + '%'
      holder.style.transform = `translate3d(0, -${100 - retardMovePercentY}%, 0)`
      spinner.style.transform = `translate3d(0, 0, 0) rotate(${active.y * 1.2 % 360}deg)`
    })
    if (movePercentY === 100) {
      active.triggered = true
      requestAnimationFrame(() => {
        spinner.style.filter = 'blur(2px)'
      })
      applet.trigger('pullToRefreshReady')
    } else {
      active.triggered = false
      requestAnimationFrame(() => {
        spinner.style.filter = 'blur(0px)'
      })
      applet.trigger('pullToRefreshRequest')
    }
  })
}
