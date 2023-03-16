import EASE from '../../lib/webAnimations/ease'
import { SegueAnimateState } from '../../types'

export default (type: number) => {
  return async (state: SegueAnimateState) => {
    let inX = 0
    let outX = 0
    let inY = 0
    let outY = 0
    const duration = 600
    const applet = state.applets[state.reverse ? 1 : 0]
    const controls = applet.controls
    const backdropReducedScale = controls?.backdropReducedScale ?? 0.03
    const swipeTransitionType = state.swipeTransitionType

    switch (type) {
      case 0:
        outY = state.height
        inY = -outY
        inX = outX = 0
        break
      case 1:
        inX = state.width
        outX = -inX
        inY = outY = 0
        break
      case 2:
        inY = state.height
        outY = -inY
        inX = outX = 0
        break
      case 3:
        outX = state.width
        inX = -outX
        inY = outY = 0
        break
    }

    if (state.reverse) {
      if (swipeTransitionType === 'slide') {
        await state.view[0].animate([
          { filter: 'brightness(0.9)', transform: `translate3d(${inX * 0.1}px, ${inY * 0.1}px, 0)` },
          { filter: 'brightness(0.9)', transform: `translate3d(0, 0, 0)` }
        ], {
          duration: 0,
          easing: 'linear',
          fill: 'forwards'
        }).finished
      } else {
        await state.view[0].animate([
          { filter: 'brightness(0.9)', transform: `scale(${1 - backdropReducedScale})` },
          { filter: 'brightness(0.9)', transform: 'scale(1)' }
        ], {
          duration: 0,
          easing: 'linear',
          fill: 'forwards'
        }).finished
      }
      await Promise.all([
        state.view[1].animate([
          { transform: `translate3d(${outX}px, ${outY}px, 0)` }
        ], {
          duration,
          easing: EASE['ease-out-expo']
        }).finished,
        state.view[0].animate([
          { transform: 'translate3d(0, 0, 0)', filter: 'brightness(1)', scale: 1 },
          { transform: 'translate3d(0, 0, 0)', filter: 'brightness(1)', scale: 1 }
        ], {
          duration,
          easing: EASE['ease-out-expo']
        }).finished
      ])
    } else {
      await state.view[0].animate([
        { transform: `translate3d(${inX}px, ${inY}px, 0)` }
      ], {
        duration: 0,
        easing: 'linear',
        fill: 'forwards'
      }).finished
      await Promise.all([
        state.view[0].animate([
          { transform: 'translate3d(0, 0, 100px)' },
        ], {
          duration,
          easing: EASE['ease-out-expo']
        }).finished,
        swipeTransitionType === 'slide'
          ? state.view[1].animate([
            { filter: 'brightness(0.9)', transform: `translate3d(${outX * .3}px, ${outY * .3}px, 0)` }
          ], {
            duration,
            easing: EASE['ease-out-expo']
          }).finished
          : state.view[1].animate([
            { filter: 'brightness(0.9)', scale: 1 - backdropReducedScale }
          ], {
            duration,
            easing: EASE['ease-out-expo']
          }).finished
      ])
    }
    return Promise.resolve(false)
  }
}
