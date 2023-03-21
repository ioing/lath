export default (element: HTMLElement) => {
  element.getAnimations?.().forEach(animation => animation.cancel())
}