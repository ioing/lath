export default async (): Promise<boolean> => {
  if (!('animate' in document.createElement('div')) || !Element.prototype.getAnimations) {
    return !!(await import('./polyfill')).default
  }
  return true
}
