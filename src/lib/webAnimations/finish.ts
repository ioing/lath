export default (element: HTMLElement) => {
  const animatePromise: Promise<Animation>[] = []
  element.getAnimations?.().forEach(animation => {
    animatePromise.push(animation.finished)
  })
  return Promise.all(animatePromise)
}