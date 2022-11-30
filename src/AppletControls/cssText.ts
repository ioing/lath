import { coveredCSSText } from '../lib/cssText/coveredCSSText'
import { fullscreenBaseCSSText } from '../lib/cssText/fullscreenBaseCSSText'

// important: relative
export const snapItemCSSText = `
  position: relative;
  display: flex;
  ${coveredCSSText}
  scroll-snap-align: start;
  scroll-snap-stop: always;
`

export const sheetViewCSSText = `
  applet-controls::-webkit-scrollbar {
    display: none;
  }
  applet-controls::scrollbar {
    display: none;
  }
`

export const backdropViewCSSText = `
  ${snapItemCSSText}
  background: rgba(0, 0, 0, .3);
  opacity: 0;
`
// important: relative
export const controlsViewCSSText = `
  position: relative;
  display: flex;
  ${coveredCSSText}
  flex-direction: row;
  overflow: auto;
  scroll-behavior: auto;
  scroll-snap-type: both mandatory;
`

export const controlsOverlayCSSText = `
  position: fixed;
  ${fullscreenBaseCSSText}
  z-index: 9;
  display: none;
`