const blockPropName = [
  'animation',
  'will-change'
]
export default async (element: HTMLElement) => {
  const currentStyle = element.style
  const styleObject: { [key: string]: [string, string] } = {}

  for (let i = 0; i < currentStyle.length; i++) {
    const propName = currentStyle[i]
    if (propName.indexOf('transition') !== -1 || blockPropName.includes(propName)) continue
    const propValue = currentStyle.getPropertyValue(propName)
    styleObject[propName] = [propValue, propValue]
  }
  return element.animate(styleObject, {
    duration: 0,
    fill: 'forwards'
  }).finished
}
