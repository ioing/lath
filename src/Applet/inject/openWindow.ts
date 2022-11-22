import { Application } from '../../types'

interface ObsoleteEvent extends TouchEvent {
  path: Array<HTMLElement>
}

export default (appletWindow: Window, application: Application): void => {
  const realOpen = appletWindow.open
  const blockClick = (event: MouseEvent | TouchEvent): boolean => {
    if (event instanceof CustomEvent && event.detail instanceof Event) {
      event = event.detail as MouseEvent
    }
    const getTouches = (target: HTMLElement) => {
      return {
        x: (event as TouchEvent).changedTouches?.[0]?.pageX || (event as MouseEvent).x,
        y: (event as TouchEvent).changedTouches?.[0]?.pageY || (event as MouseEvent).y,
        target
      }
    }
    const getProps = (target: HTMLElement) => {
      return {
        title: target.getAttribute('title') || '',
        preset: target.getAttribute('preset-effect') || 'slide',
        cloneAs: target.getAttribute('clone-as') || undefined
      }
    }
    const path = (event as ObsoleteEvent).path || event.composedPath?.() || []
    path.splice(-3)

    for (const el of path) {
      const toApplet = el.getAttribute?.('to-applet')
      if (toApplet) {
        const { cloneAs, title, preset } = getProps(el)
        const [id, param] = toApplet.split('?')
        if (cloneAs) {
          application.get(id).then((applet) => {
            const appletManifest = applet.model
            Object.assign(appletManifest.config, {
              title,
              animation: preset,
              level: application.activityLevel
            })
            application.add(cloneAs, appletManifest)
            application.to(cloneAs, '?' + param, undefined, getTouches(el))
          })
          break
        }
        application.to(id, '?' + param, undefined, getTouches(el))
        break
      } else if (el.tagName === 'A') {
        const anchor = el as HTMLAnchorElement
        const href = anchor.href || String(anchor)
        if (href) {
          if (anchor.target === '_parent' || anchor.target === '_top') {
            realOpen(href)
            return false
          }
          const { cloneAs, title, preset } = getProps(el)
          event.stopPropagation()
          event.preventDefault()
          application.pushWindow(href, title, preset, cloneAs, getTouches(anchor)).catch(() => {
            realOpen(href)
          })
        }
      }
    }
    return false
  }
  appletWindow.document.addEventListener('click', blockClick, true)
  appletWindow.open = (url?: string | URL | undefined, target?: string | undefined, features?: string | undefined): Window | null => {
    if (typeof url === 'string' && (!target || target.indexOf('_') === 0) && !features) {
      application.pushWindow(url, '').catch(() => {
        realOpen(url)
      })
    } else {
      return realOpen(url, target, features)
    }
    return null
  }
}
