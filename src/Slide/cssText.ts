import { coveredCSSText } from '../lib/cssText/coveredCSSText'
import { fullscreenBaseCSSText } from '../lib/cssText/fullscreenBaseCSSText'
import { SlideViewSnapType } from "../types"

export const viewportCSSText = `
  display: flex;
  ${coveredCSSText}
  scroll-snap-align: start;
  scroll-snap-stop: always;
  transform: translate3d(0, 0, 0);
`

export const slideBaseCSSText = `
  slideView-viewport::-webkit-scrollbar {
    display: none;
  }
  slideView-viewport::scrollbar {
    display: none;
  }
`

export const getSlideViewCSSText = (snapType: SlideViewSnapType, slideViewGridRepeat: number, hasSmoothSnapScrolling: boolean) => {
  return `
    ${snapType === 'y' ? 'overflow-y: auto; overflow-x: hidden;' : snapType === 'x' ? 'display: flex; overflow-x: auto; overflow-y: hidden;' : `
      display: grid;
      overflow: auto;
      grid-template-columns: repeat(${slideViewGridRepeat}, 100%);
      grid-template-rows: repeat(${slideViewGridRepeat}, 100%);
    `}
    position: absolute;
    ${fullscreenBaseCSSText}
    z-index: 2;
    scroll-behavior: ${!hasSmoothSnapScrolling ? 'auto' : 'smooth'};
    scroll-snap-type: ${snapType} mandatory;
  `
}

export const slideViewHolderCSSText = `
  position: absolute;
  top: 15%;
  bottom: 15%;
  left: 0;
  width: 15px;
  z-index: 5;
`
export const slideViewOverlayCSSText = `
  position: fixed;
  ${fullscreenBaseCSSText}
  z-index: 7;
  display: none;
`