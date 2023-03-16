import EASE from '../../lib/webAnimations/ease'
import { SegueAnimateState } from '../../types'

export default (type: number) => {
  return async (state: SegueAnimateState) => {
    const attachOrigin = typeof state.attach === 'string' ? state.attach : `${state.attach[0]}px, ${state.attach[1]}px`
    const actionOrigin = state.applets[1].getActionOrigin()
    const origin = actionOrigin ? `${actionOrigin.x}px, ${actionOrigin.y}px` : (typeof state.origin === 'string' ? state.origin : `${state.origin[0]}px, ${state.origin[1]}px`)
    if (type === 0) {
      await Promise.all([
        state.view[0].animate([
          {
            backfaceVisibility: 'hidden',
            transform: `translate3d(0, 0, 0) scale(2.5)`,
            transformOrigin: attachOrigin
          },
          {
            filter: 'brightness(1)',
            transform: `translate3d(0, 0, 0) scale(1)`,
          }
        ], {
          duration: 767,
          easing: EASE['ease-out-expo'],
          fill: 'forwards'
        }).finished,
        state.view[1].animate({
          backfaceVisibility: 'hidden',
          transform: `translate3d(0, 0, 0) scale(0.0001)`,
          transformOrigin: origin
        }, {
          duration: 767,
          easing: EASE['ease-out-expo'],
          fill: 'forwards'
        }).finished.then(() => {
          state.view[1].animate({
            opacity: 0
          }, {
            duration: 10,
            easing: EASE['ease'],
            fill: 'forwards'
          }).play()
        })
      ])
      return false
    } else {
      await Promise.all([
        state.view[0].animate([
          {
            backfaceVisibility: 'hidden',
            transform: `translate3d(0, 0, 0) scale(0)`,
            transformOrigin: origin
          },
          {
            transform: `translate3d(0, 0, 0) scale(1)`,
          }
        ], {
          duration: 767,
          easing: EASE['ease-out-expo'],
          fill: 'forwards'
        }).finished,
        state.view[1].animate([
          {
            backfaceVisibility: 'hidden',
            transform: `translate3d(0, 0, 0) scale(1)`,
            transformOrigin: attachOrigin,
            filter: 'brightness(1)'
          },
          {
            transform: `translate3d(0, 0, 0) scale(2.5)`,
            filter: 'brightness(0.5)'
          }
        ], {
          duration: 767,
          easing: EASE['ease-out-expo'],
          fill: 'forwards'
        }).finished
      ])
      return false
    }
  }
}
