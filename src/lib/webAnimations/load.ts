export default async (): Promise<boolean> => {
  if (!('animate' in document.createElement('div')) || !Element.prototype.getAnimations) {
    try {
      return !!(await import('./polyfill')).default
    } catch (e) {
      return false
    }
  }
  return true
}
