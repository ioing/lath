import { ApplicationBase } from './Base'
import { Applet } from '../types'

interface ApplicationRouteInfo {
  id: string
  param: string
  search: string
}

class ApplicationState extends ApplicationBase {
  get route(): ApplicationRouteInfo {
    const router = this.routerRegExp.exec(location.hash) || []
    const id = router[1]
    const param = router[2]
    const search = location.search

    return {
      id: id ? decodeURIComponent(id) : '',
      param: param ? decodeURIComponent(param) : '',
      search
    }
  }
  get exists(): boolean {
    try {
      return parseInt(sessionStorage.getItem(location.pathname + '__EXISTS') || '-1', 10) === history.length
    } catch (e) {
      return false
    }
  }
  get activityApplet(): Applet | undefined {
    const id = this.segue.id
    const applet = this.applets[id]
    return applet
  }
  get prevActivityApplet(): Applet | undefined {
    const id = this.segue.prevId
    const applet = this.applets[id]
    return applet
  }
  get activityLevel() {
    return (this.activityApplet?.level ?? 0) + 1
  }
  get isFullscreen(): boolean {
    return document.body.offsetHeight === screen.height
  }
  public overscrollHistoryNavigation = {
    moment: 0,
    type: ''
  }
  public properties = {
    darkTheme: window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
  }
  public setExists(): Promise<void> {
    const key = location.pathname + '__EXISTS'
    const len = String(history.length)
    return new Promise<void>((resolve, reject) => {
      try {
        sessionStorage.setItem(key, len)
        resolve()
      } catch (e) {
        try {
          sessionStorage.clear()
          sessionStorage.setItem(key, len)
        } catch (error) {
          reject()
        }
      }
    })
  }
  public activeState: 'active' | 'frozen' = 'active'
  public activate(active: boolean) {
    const state = active ? 'active' : 'frozen'
    const messageType = 'application-' + state
    if (window.applicationActiveState === state) return
    this.activeState = state
    this.trigger(state)
    window.applicationActiveState = state
    window.postMessage({
      type: messageType
    }, '*')

    // Tunneling child app
    for (const id in this.applets) {
      const applet = this.applets[id]
      if (applet.sandbox && !applet.sameOrigin) {
        applet.triggerWindow(messageType)
      }
    }
  }
}

export {
  ApplicationState
}
