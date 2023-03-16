import { SegueAnimateState } from '../../types'

export default async (state: SegueAnimateState) => {
  const applet = state.applets[state.reverse ? 1 : 0]
  const controls = applet.controls
  const swipeTransitionType = state.swipeTransitionType
  if (!controls) return Promise.resolve(false)
  if (!state.reverse) {
    await state.view[0].animate({
      transform: `translate3d(0, 0, 0)`
    }, {
      duration: 0,
      fill: 'forwards'
    }).finished
    if (swipeTransitionType === 'slide') {
      state.view[1].animate({
        transform: `translate3d(-30%, 0, 0)`
      }, {
        delay: 100,
        duration: 400,
        fill: 'forwards'
      }).play()
    } else {
      state.view[1].animate({
        transform: `translate3d(0, 0, 0) scale(${1 - controls.backdropReducedScale})`
      }, {
        duration: 400,
        fill: 'forwards'
      }).play()
    }
    await controls?.show()
    return Promise.resolve(false)
  } else {
    state.applets[0].controls?.appearImmediately()
    if (state.applets[1].controls?.visibility === true) {
      if (swipeTransitionType === 'slide') {
        await state.view[0].animate({
          transform: `translate3d(-30%, 0, 0)`
        }, {
          duration: 0,
          fill: 'forwards'
        }).finished
        state.view[0].animate({
          transform: `translate3d(0, 0, 0)`
        }, {
          duration: 400,
          fill: 'forwards'
        }).play()
      } else {
        await state.view[0].animate({
          transform: `translate3d(0, 0, 0) scale(${1 - controls.backdropReducedScale})`
        }, {
          duration: 0,
          fill: 'forwards'
        }).finished
        state.view[0].animate({
          transform: `translate3d(0, 0, 0) scale(1)`
        }, {
          duration: 400,
          fill: 'forwards'
        }).play()
      }
      await controls?.hide()
    }
    return Promise.resolve(false)
  }
}
