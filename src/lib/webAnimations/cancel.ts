export default (element: HTMLElement) => {
  element.getAnimations?.().forEach(animation => {
    animation.finish()
    animation.cancel()
  })
  const computedStyle = window.getComputedStyle(element)
  const styleObject: { [key: string]: string } = {}
  for (let i = 0; i < computedStyle.length; i++) {
    const propName = computedStyle[i]
    const propValue = computedStyle.getPropertyValue(propName)
    styleObject[propName] = propValue
  }
  const restAnimate = element.animate(styleObject, {
    duration: 0,
    fill: 'forwards'
  })
  restAnimate.finish()
  restAnimate.cancel()
}