export default async (): Promise<boolean> => {
  if (!('AnimationEvent' in window)) {
    return !!(await import('./polyfill')).default
  }
  return true
}
