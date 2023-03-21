export default async (): Promise<boolean> => {
  if ('animate' in document.createElement('div')) {
    return !!(await import('./polyfill')).default
  }
  return true
}
