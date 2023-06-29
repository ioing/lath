export default async (element: HTMLElement) => {
  return await Promise.all(
    element.getAnimations?.({ subtree: true }).map((animation) => animation.finished)
  )
}