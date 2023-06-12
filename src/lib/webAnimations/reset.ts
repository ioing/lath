export default async (element: HTMLElement) => {
  const currentStyle = element.style
  const styleObject: { [key: string]: string } = {}

  for (let i = 0; i < currentStyle.length; i++) {
    const propName = currentStyle[i]
    const propValue = currentStyle.getPropertyValue(propName)
    styleObject[propName] = propValue
  }
  return element.animate(styleObject, {
    duration: 0,
    fill: 'forwards'
  }).finished
}