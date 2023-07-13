import needsPolyfill from '../lib/wc/needsPolyfill'

/**
 * Obsolete
 * ------------- start -------------
 */
let _USE_SHADOW_DOM = true
if (needsPolyfill && /iPhone OS [0-9]_\d(_\d)? like mac os x/ig.exec(navigator.userAgent)) {
  _USE_SHADOW_DOM = false
}

if (window.__LATH_NO_SHADOW_DOM__) {
  _USE_SHADOW_DOM = false
}

/**
* Obsolete
* ------------- end -------------
*/

let _USE_PERCENTAGE = false
interface EnvOptions {
  USE_SHADOW_DOM?: boolean,
  USE_PERCENTAGE?: boolean
}

export function setEnv(options: EnvOptions) {
  _USE_SHADOW_DOM = options.USE_SHADOW_DOM ?? _USE_SHADOW_DOM
  _USE_PERCENTAGE = options.USE_PERCENTAGE ?? _USE_PERCENTAGE
}
export function getEnv() {
  return {
    USE_SHADOW_DOM: _USE_SHADOW_DOM,
    USE_PERCENTAGE: _USE_PERCENTAGE
  }
}