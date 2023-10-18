type timeout = (handler: TimerHandler, timeout?: number | undefined, ...args: unknown[]) => number
declare interface Window {
  Function: FunctionConstructor
  setBackgroundTimeout?: timeout
  setBackgroundInterval?: timeout
  appletVisibilityState: 'visible' | 'hidden' | 'willVisible' | 'willHidden'
  applicationActiveState?: 'active' | 'frozen'
  __LATH_APPLICATION_AVAILABILITY__?: boolean
  __LATH_APPLICATION_TUNNELING__?: boolean
  WebComponents: {
    needsPolyfill: boolean
    ready: boolean
    waitFor: (fn: () => void) => void
    _batchCustomElements: () => void
  }
  __isElementAnimateDefined?: boolean
  ShadyDOM: {
    force: boolean
  },
  __LATH_NO_SHADOW_DOM__?: boolean
}
declare interface HTMLPortalElement extends HTMLIFrameElement {
  activate: () => Promise<void>
}

declare interface AnimationKeyFrame extends AnimationKeyFrame {
  [key: string]: string | number | [string | number, string | number] | undefined
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