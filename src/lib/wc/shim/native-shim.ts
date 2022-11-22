interface CustomElementRegistryHasPolyfill extends CustomElementRegistry {
  polyfillWrapFlushCallback: ((outer: (fn: () => void) => void) => void) | undefined
}
const nativeShim = function (shadowWindow: Window & typeof globalThis) {
  if (
    // No Reflect, no classes, no need for shim because native custom elements
    // require ES2015 classes or Reflect.
    shadowWindow.Reflect === undefined ||
    shadowWindow.customElements === undefined ||
    // The webcomponentsjs custom elements polyfill doesn't require
    // ES2015-compatible construction (`super()` or `Reflect.construct`).
    (shadowWindow.customElements as CustomElementRegistryHasPolyfill)['polyfillWrapFlushCallback']
  ) return
  interface IBuiltInHTMLElement {
    new(): HTMLElement
    prototype: HTMLElement
  }
  const BuiltInHTMLElement = shadowWindow.HTMLElement
  /**
   * With js compiler's RECOMMENDED_FLAGS the function name will be optimized away.
   * However, if we declare the function as a property on an object literal, and
   * use quotes for the property name, then closure will leave that much intact,
   * which is enough for the JS VM to correctly set Function.prototype.name.
   */
  const wrapperForTheName = {
    'HTMLElement': /** @this {!Object} */ function HTMLElement() {
      return shadowWindow.Reflect.construct(BuiltInHTMLElement, [], /** @type {!Function} */(this.constructor))
    }
  }
  shadowWindow.HTMLElement = wrapperForTheName['HTMLElement'] as unknown as IBuiltInHTMLElement
  shadowWindow.HTMLElement.prototype = BuiltInHTMLElement.prototype
  shadowWindow.HTMLElement.prototype.constructor = shadowWindow.HTMLElement
  shadowWindow.Object.setPrototypeOf(shadowWindow.HTMLElement, BuiltInHTMLElement)
}
nativeShim(window)

export default nativeShim
