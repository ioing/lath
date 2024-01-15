export default (element: HTMLElement, subtree = false) => {
  element.getAnimations?.({ subtree }).forEach(animation => {
    animation.cancel()
  })
}