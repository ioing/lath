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

export const USE_SHADOW_DOM = _USE_SHADOW_DOM