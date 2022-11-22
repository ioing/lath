const needsShadowDom = !('attachShadow' in Element.prototype && 'getRootNode' in Element.prototype)
const needsCustomElements = !window.customElements
const needsTemplate = (function () {
  // no real <template> because no `content` property (IE and older browsers)
  const t = document.createElement('template')
  if (!('content' in t)) {
    return true
  }
  // broken doc fragment (older Edge)
  if (!(t.content.cloneNode() instanceof DocumentFragment)) {
    return true
  }
  // broken <template> cloning (Edge up to at least version 17)
  const t2 = document.createElement('template')
  t2.content.appendChild(document.createElement('div'))
  t.content.appendChild(t2)
  const clone = t.cloneNode(true) as HTMLTemplateElement
  return (
    clone.content.childNodes.length === 0 ||
    (clone.content.firstChild as HTMLTemplateElement).content.childNodes.length === 0
  )
})()

export default !window.Promise ||
  !Array.from ||
  !window.URL ||
  !window.Symbol ||
  needsTemplate ||
  needsShadowDom ||
  needsCustomElements