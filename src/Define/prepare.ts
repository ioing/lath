import needsPolyfill from '../lib/wc/needsPolyfill'

// The core logic is separated from the above-the-fold dependency.
import('..').catch((e) => {
  console.warn(e)
})

/**
 * Android 4.0 & iOS 10.2 and below require Polyfill.
 * Currently, less than 0.1% of device types are used, so this section is loaded on demand.
 */
if (needsPolyfill) {
  import('@webcomponents/webcomponentsjs').catch((e) => {
    console.warn(e)
  })
}

if (typeof Element.prototype.scrollTo !== 'function') {
  import('scroll-polyfill/auto').catch((e) => {
    console.warn(e)
  })
}