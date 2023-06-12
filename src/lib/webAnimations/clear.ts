export default async (element: HTMLElement, subtree = false) => {
  element.getAnimations?.({ subtree }).forEach(animation => {
    animation.finish()
    animation.cancel()
  })
}