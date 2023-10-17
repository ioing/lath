import './prepare'
// 1. import custom-elements iOS < 10.2
import '@webcomponents/custom-elements'

// 2. define
import { DefineApplet } from './DefineApplet'
import { DefineApplication } from './DefineApplication'
import typeError from '../lib/typeError'
import needsPolyfill from '../lib/wc/needsPolyfill'

if (needsPolyfill) {
  import('@webcomponents/webcomponentsjs').catch((e) => {
    console.warn(e)
  })
}

export const initApplication = () => {
  const defineElements = () => {
    if (customElements.get('define-applet') || customElements.get('define-application')) {
      typeError(1003)
      return
    }
    customElements.define('define-applet', DefineApplet)
    customElements.define('define-application', DefineApplication)
  }
  if (needsPolyfill) {
    import('@webcomponents/webcomponentsjs').then(defineElements).catch((e) => {
      console.warn(e)
    })
  } else {
    defineElements()
  }
}
