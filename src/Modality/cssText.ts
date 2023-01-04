import { coveredCSSText } from '../lib/cssText/coveredCSSText'

export const baseCSSText = `
  applet-viewport {
    background: transparent !important;
  }
  modality-container {
    display: flex;
    height: 100%;
    overflow-y: scroll !important;
    scroll-behavior: smooth;
    scroll-snap-type: y mandatory;
    flex-direction: column;
  }
  modality-container::-webkit-scrollbar {
    display: none;
  }
  modality-container::scrollbar {
    display: none;
  }
  modality-placeholder {
    position: relative;
    display: block;
    ${coveredCSSText}
    scroll-snap-align: start;
    scroll-snap-stop: always;
    box-sizing: content-box;
  }
  modality-handle {
    display: block;
    position: absolute;
    top: 100%;
    height: 20px;
    width: 100%;
    z-index: 2;
  }
  modality-handle::before {
    content: ' ';
    display: block;
    width: 36px;
    height: 5px;
    margin: 5px auto;
    border-radius: 5px;
    background: #777;
    opacity: .5;
  }
  modality-handle:hover::before {
    opacity: 1;
  }
  blocked-holder {
    position: absolute;
    top: 200px;
    left: 0;
    bottom: 200px;
    width: 40px;
    z-index: 5;
    overflow-y: hidden;
    overflow-x: scroll;
    overscroll-behavior-y: none;
    display: flex;
    flex-flow: row-reverse;
  }
  blocked-holder::-webkit-scrollbar {
    display: none;
  }
  blocked-holder::scrollbar {
    display: none;
  }
  blocked-holder::before {
    content: ' ';
    display: flex;
    min-width: 100vw;
    height: 100%;
  }
`