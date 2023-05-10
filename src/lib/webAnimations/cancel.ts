export default (element: HTMLElement) => {
  element.getAnimations?.().forEach(animation => {
    animation.finish()
    animation.cancel()
  })
  const currentStyle = element.style
  const styleObject: { [key: string]: string } = {}
  for (let i = 0; i < currentStyle.length; i++) {
    const propName = currentStyle[i]
    const propValue = currentStyle.getPropertyValue(propName)
    styleObject[propName] = propValue
  }
  const restAnimate = element.animate(styleObject, {
    duration: 0,
    fill: 'forwards'
  })
  restAnimate.finish()
  restAnimate.cancel()
}