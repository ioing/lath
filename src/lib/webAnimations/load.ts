export default async (): Promise<boolean> => {
  if (!('animate' in document.createElement('div'))) {
    try {
      return !!(await import('./polyfill')).default
    } catch (e) {
      return false
    }
  }
  return true
}
