export const setGlobalCSS = () => {
  const baseStyle = document.createElement('style')
  baseStyle.innerHTML = `
    body {
      overscroll-behavior-y: none;
    }
  `
  document.getElementsByTagName('head')[0].appendChild(baseStyle)
}
export const getBaseStyle = (darkTheme: boolean) => {
  const rgb = darkTheme ? '30, 30, 30' : '255, 255, 255'
  return `
    .applet-loading {
      position: fixed;
      z-index: 1;
      height: 2em;
      width: 2em;
      overflow: visible;
      margin: auto;
      right: 0;
      bottom: 0;
      left: 0;
      font: 0/0 a;
      color: transparent;
      text-shadow: none;
      background-color: transparent;
      border: 0;
      transform: translate3d(0, 0, 0) scale(.6);
    }

    .applet-spinner {
      content: ' ';
      display: block;
      font-size: 10px;
      width: 1em;
      height: 1em;
      margin-top: -7em;
      border-radius: 0.5em;
      transform: translate3d(0, 0, 0) rotate(0deg);
      animation-duration: 16ms;
      box-shadow: rgba(${rgb}, 0.75) 1.5em 0 0 0, rgba(${rgb}, 0.75) 1.1em 1.1em 0 0, rgba(${rgb}, 0.75) 0 1.5em 0 0, rgba(${rgb}, 0.75) -1.1em 1.1em 0 0, rgba(${rgb}, 0.75) -1.5em 0 0 0, rgba(${rgb}, 0.75) -1.1em -1.1em 0 0, rgba(${rgb}, 0.75) 0 -1.5em 0 0, rgba(${rgb}, 0.75) 1.1em -1.1em 0 0;
    }
    @keyframes applet-spinner {
      0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
      }
      100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }
  `
}
export const getHolderStyle = (darkTheme: boolean) => {
  return `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    z-index: 999999;
    background: ${darkTheme ? 'rgba(255, 255, 255, .5)' : 'rgba(0, 0, 0, .5)'};
    transform: translate3d(0, -100%, 0);
    transition-property: transform;
    border-radius: 0 0 50% 50%;
    backdrop-filter: blur(20px); 
    -webkit-backdrop-filter: blur(20px);
  `
}
export const holdLayerStyle = `
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 7;
  display: none;
`