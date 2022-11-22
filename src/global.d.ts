type timeout = (handler: TimerHandler, timeout?: number | undefined, ...args: unknown[]) => number
declare interface Window {
  Function: FunctionConstructor
  setBackgroundTimeout?: timeout
  setBackgroundInterval?: timeout
  appletVisibilityState: 'visible' | 'hidden' | 'willVisible' | 'willHidden'
  applicationActiveState?: 'active' | 'frozen'
  __LATH_APPLICATION_AVAILABILITY__: boolean
  WebComponents: {
    needsPolyfill: boolean
    ready: boolean
    waitFor: (fn: () => void) => void
    _batchCustomElements: () => void
  }
  ShadyDOM: {
    force: boolean
  }
}
declare interface HTMLPortalElement extends HTMLIFrameElement {
  activate: () => Promise<void>
}

declare global {
  declare namespace JSX {
    interface IntrinsicElements {
      'define-applet': {
        children: Element
        'applet-id': string
      }
      'define-application': {
        children: Element
        'default-applet': string
      }
    }
  }
}