export default (): Promise<void> => {
  if (typeof Element.prototype.scrollTo !== 'function') {
    return import('scroll-polyfill/auto').catch((e) => {
      console.warn(e)
    })
  }
  return Promise.resolve()
}
