const cssPropertyWhitelist = [
  'opacity',
  'color',
  'background-color',
  'border-color',
  'border-width',
  'border-radius',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'top',
  'right',
  'bottom',
  'left',
  'width',
  'height',
  'min-width',
  'min-height',
  'max-width',
  'max-height',
  'transform',
  'transform-origin',
  'box-shadow',
  'background-position',
  'background-size',
  'outline',
  'outline-width',
  'outline-color',
  'clip-path',
  'filter',
  'perspective',
  'perspective-origin',
  'backdrop-filter'
]

export default async (element: HTMLElement) => {
  const currentStyle = element.style
  const styleObject: { [key: string]: [string, string] } = {}

  for (let i = 0; i < currentStyle.length; i++) {
    const propName = currentStyle[i]
    if (propName.indexOf('transition') !== -1 || !cssPropertyWhitelist.includes(propName)) continue
    const propValue = currentStyle.getPropertyValue(propName)
    styleObject[propName] = [propValue, propValue]
  }
  // Prevents processed elements from already being unloaded.
  return typeof element.animate === 'function' && element.animate(styleObject, {
    duration: 0,
    fill: 'forwards'
  }).finished
}
