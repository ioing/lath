import { setTimeout } from '../../lib/util'

interface TouchActive {
  element: null | HTMLElement
  oldFilterStyle: string
  oldTransitionStyle: string
  waitingToAddTimeId: number
}

interface ObsoleteTouchEvent extends TouchEvent {
  path: Array<HTMLElement>
}

export default (appletWindow: Window, capture?: string | string[]): void => {
  const touchActive: TouchActive = {
    element: null,
    oldFilterStyle: '',
    oldTransitionStyle: '',
    waitingToAddTimeId: -1
  }
  const addHighlight = (event: TouchEvent): void => {
    const captureList = capture ? typeof capture === 'string' ? capture.split(' ') : capture : null
    const path = (event as ObsoleteTouchEvent).path || event.composedPath() || []
    path.splice(-3)
    const anchor: HTMLElement | null = (() => {
      for (const el of path) {
        if (el.tagName === 'A') return el
        if (!el.children?.length) continue
        if (captureList) {
          for (const attr of captureList) {
            if (attr.indexOf('#') === 0 && '#' + el.id === attr) return el
            if (attr.indexOf('.') === 0 && el.classList.length) {
              if (Object.values(el.classList).includes(attr.slice(1))) return el
            }
            if (el.getAttribute?.(attr)) return el
          }
          return null
        }
      }
      const target = (path[0]?.children?.length ? path[0] : path[1]) || event.target
      if (['DIV', 'A', 'IMG'].includes(target.tagName)) return target
      return null
    })()
    if (!anchor) return
    if (touchActive.element === anchor) return
    if (touchActive.element) {
      return cancelHighlight()
    }
    touchActive.element = anchor
    touchActive.oldFilterStyle = anchor.style.filter
    touchActive.oldTransitionStyle = anchor.style.transition
    // Prevent multiple types of click effects from overlaying
    // Non-standard[webkitTapHighlightColor]: This feature is non-standard and is not on a standards track.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    anchor.style.webkitTapHighlightColor = 'rgba(0, 0, 0, 0)'
    anchor.style.transition = touchActive.oldTransitionStyle ? touchActive.oldTransitionStyle + ', ' : '' + 'all .2s ease'
    touchActive.waitingToAddTimeId = setTimeout(() => {
      if (touchActive.element === anchor) {
        const elWidth = anchor.offsetWidth
        const elHeight = anchor.offsetHeight
        if (elWidth * elHeight > 90000) return
        anchor.style.filter = touchActive.oldFilterStyle + ' brightness(.8)'
        anchor.setAttribute('tap-highlight', 'true')
      }
    }, 60)
  }
  const cancelHighlight = (): void => {
    if (!touchActive.element) return
    clearTimeout(touchActive.waitingToAddTimeId)
    if (touchActive.element?.style.filter) {
      touchActive.element.style.filter = touchActive.oldFilterStyle
    }
    touchActive.element.removeAttribute('tap-highlight')
    setTimeout(() => {
      if (touchActive.element?.style.transition) {
        touchActive.element.style.transition = touchActive.oldTransitionStyle
      }
      touchActive.element = null
      touchActive.oldFilterStyle = ''
      touchActive.oldTransitionStyle = ''
    }, 200)
  }
  const delayCancelHighlight = (): void => {
    // Make entry control（appletWindow.setTimeout）
    appletWindow.setTimeout(() => {
      cancelHighlight()
    }, 300)
  }
  appletWindow.document.addEventListener('touchstart', addHighlight)
  appletWindow.document.addEventListener('touchmove', cancelHighlight)
  appletWindow.document.addEventListener('touchcancel', cancelHighlight)
  appletWindow.document.addEventListener('touchend', delayCancelHighlight)
}
