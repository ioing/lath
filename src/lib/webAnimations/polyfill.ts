import 'web-animations-js/web-animations-next.min'

type OriginalAnimate = (keyframes: AnimationsProperty | AnimationsKeyFramesProperty, options?: number | KeyframeAnimationOptions | undefined) => Animation
type AnimationsProperty = {
  [key in keyof CSSStyleDeclaration]?: [CSSStyleDeclaration[key], CSSStyleDeclaration[key]]
}
type AnimationsKeyFramesProperty = {
  [key in keyof CSSStyleDeclaration]?: CSSStyleDeclaration[key]
}[]
type KeyframesArray = Array<CSSStyleDeclaration>
type KeyframeObject = CSSStyleDeclaration

declare global {
  interface Element {
    animations: Animation[]
  }
}

function convertKeyframes(element: Element, keyframes: KeyframesArray | KeyframeObject): AnimationsProperty | AnimationsKeyFramesProperty {
  const newKeyFrames: AnimationsProperty = {}
  const computedStyle = getComputedStyle(element)
  if (Array.isArray(keyframes)) {
    if (keyframes.length > 1) {
      return keyframes as unknown as AnimationsProperty
    }
    return [keyframes[0], keyframes[0]]
  }
  for (const propertyName in keyframes) {
    if (!Array.isArray(keyframes[propertyName])) {
      newKeyFrames[propertyName] = [computedStyle[propertyName], keyframes[propertyName]]
    } else {
      newKeyFrames[propertyName] = [keyframes[propertyName][0], keyframes[propertyName][1]]
    }
  }
  return newKeyFrames
}

if (!window.__isElementAnimateDefined) {
  window.__isElementAnimateDefined = true

  const originalAnimate = Element.prototype.animate as unknown as OriginalAnimate
  Element.prototype.animate = function (keyframes: Keyframe[] | PropertyIndexedKeyframes | null, options?: number | KeyframeAnimationOptions): Animation {
    const animation = originalAnimate.call(this, convertKeyframes(this, keyframes as unknown as (KeyframesArray | KeyframeObject)), options) as Animation
    if (!this.animations) {
      this.animations = []
    }
    this.animations.push(animation)
    return animation
  }
  Element.prototype.getAnimations = function (options?: GetAnimationsOptions): Animation[] {
    const animations = this.animations || []
    if (options?.subtree) {
      this.querySelectorAll('*').forEach(node => {
        if (node.animations.length) animations.concat(node.animations)
      })
    }
    return animations
  }
}

export default true
