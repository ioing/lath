import { SegueState } from './State'
import { SegueAnimateState, AnimationConfig, AnimationPrestType } from '../types'

type SegueAnimateFn = (e: SegueAnimateState) => undefined | Promise<boolean>

class SegueAnimation extends SegueState {
  public checkAnimationNamed(): boolean {
    return !!this.getAnimationNames()
  }

  public checkNativeAnimation(): boolean {
    const animationNames = this.getAnimationNames()
    if (typeof animationNames === 'string') {
      return ['slide', 'slide-left'].includes(animationNames)
    }
    return false
  }

  public getAnimationNames(): AnimationPrestType | boolean | undefined | AnimationConfig {
    if (this.options.index && this.applet.isFullscreen && this.isEntryApplet) return false
    if (this.isOverscrollHistoryNavigation || this.backFromType === 'controls') return false
    const usePrevAppletAnimation = this.countercurrent
    const animationNames = this[usePrevAppletAnimation ? 'prevApplet' : 'applet']?.config.animation ?? 'slide'
    if (animationNames === true || animationNames === 'inherit') {
      return this.options.defaultAnimation
    }
    return animationNames
  }

  public async getAnimationGroup(): Promise<[SegueAnimateFn, SegueAnimateFn] | undefined> {
    let animationFunction: [SegueAnimateFn, SegueAnimateFn] | undefined
    const animationNames = this.getAnimationNames()
    if (typeof animationNames === 'string') {
      animationFunction = await this.getAnimationByName(animationNames)
    } else if (typeof (animationNames as [SegueAnimateFn, SegueAnimateFn])?.[0] === 'function') {
      return animationNames as [SegueAnimateFn, SegueAnimateFn]
    }

    if (typeof animationFunction?.[0] !== 'function') {
      return
    }

    return animationFunction
  }

  public async getAnimationOneSide(backset: number): Promise<SegueAnimateFn | undefined> {
    const animationGroup = await this.getAnimationGroup()
    if (backset >= 0) {
      switch (typeof animationGroup) {
        case 'function':
          return animationGroup
        case 'object':
          return animationGroup[animationGroup.length === 2 ? backset : 0]
        default:
          return
      }
    }
    return
  }

  public async getAnimationByName(type: AnimationPrestType): Promise<[SegueAnimateFn, SegueAnimateFn] | undefined> {
    switch (type) {
      case 'popup':
        return new Promise((resolve, reject) => {
          import('./preset/popup').then((applet) => {
            const popup = applet.default
            resolve([popup, popup])
          }).catch(reject)
        })
      case 'stretch':
        return new Promise((resolve, reject) => {
          import('./preset/stretch').then((applet) => {
            const stretch = applet.default
            resolve([stretch, stretch])
          }).catch(reject)
        })
      case 'flip':
        return new Promise((resolve, reject) => {
          import('./preset/flip').then((applet) => {
            const flip = applet.default
            resolve([flip(4), flip(4)])
          }).catch(reject)
        })
      case 'flip-left':
        return new Promise((resolve, reject) => {
          import('./preset/flip').then((applet) => {
            const flip = applet.default
            resolve([flip(3), flip(3)])
          }).catch(reject)
        })
      case 'flip-down':
        return new Promise((resolve, reject) => {
          import('./preset/flip').then((applet) => {
            const flip = applet.default
            resolve([flip(2), flip(2)])
          }).catch(reject)
        })
      case 'flip-right':
        return new Promise((resolve, reject) => {
          import('./preset/flip').then((applet) => {
            const flip = applet.default
            resolve([flip(1), flip(1)])
          }).catch(reject)
        })
      case 'flip-up':
        return new Promise((resolve, reject) => {
          import('./preset/flip').then((applet) => {
            const flip = applet.default
            resolve([flip(0), flip(0)])
          }).catch(reject)
        })
      case 'fade':
        return new Promise((resolve, reject) => {
          import('./preset/fade').then((applet) => {
            const fade = applet.default
            resolve([fade(1), fade(0)])
          }).catch(reject)
        })
      case 'zoom':
        return new Promise((resolve, reject) => {
          import('./preset/zoom').then((applet) => {
            const zoom = applet.default
            resolve([zoom(1), zoom(0)])
          }).catch(reject)
        })
      case 'slide-right':
        return new Promise((resolve, reject) => {
          import('./preset/slide').then((applet) => {
            const slide = applet.default
            resolve([slide(3), slide(1)])
          }).catch(reject)
        })
      case 'slide-up':
        return new Promise((resolve, reject) => {
          import('./preset/slide').then((applet) => {
            const slide = applet.default
            resolve([slide(2), slide(0)])
          }).catch(reject)
        })
      case 'slide-down':
        return new Promise((resolve, reject) => {
          import('./preset/slide').then((applet) => {
            const slide = applet.default
            resolve([slide(0), slide(2)])
          }).catch(reject)
        })
      case 'slide':
      case 'slide-left':
      default:
        return new Promise((resolve, reject) => {
          if (this.options.swipeModel) {
            import('./preset/slide-native').then((applet) => {
              const slide = applet.default
              resolve([slide, slide])
            }).catch(reject)
          } else {
            import('./preset/slide').then((applet) => {
              const slide = applet.default
              resolve([slide(1), slide(3)])
            }).catch(reject)
          }
        })
    }
  }
}

export {
  SegueAnimation
}
