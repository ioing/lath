export const globalCSSText = `
  html, body {
    width: 100vw;
    height: 100vh;
    min-width: 100vw;
    min-height: 100vh;
    max-width: 100vw;
    max-height: 100vh;
    overflow: hidden;
  }
  body::-webkit-scrollbar {
    display: none;
  }
  body::scrollbar {
    display: none;
  }
  define-applet {
    display: block;
  }
`
