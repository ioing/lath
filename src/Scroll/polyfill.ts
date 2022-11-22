export default (): Promise<void> => {
  if (typeof Element.prototype.scrollTo !== 'function') {
    return import('scroll-polyfill/auto')
  }
  return Promise.resolve()
}
