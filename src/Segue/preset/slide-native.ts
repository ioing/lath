import { SegueAnimateState } from '../../types'

export default async (state: SegueAnimateState) => {
  const applet = state.applets[state.reverse ? 1 : 0]
  const controls = applet.controls
  const swipeTransitionType = state.swipeTransitionType
  if (!controls) return Promise.resolve(false)
  if (!state.reverse) {
    await state.in.duration(0).to(0, 0, 0).end()
    if (swipeTransitionType === 'slide') {
      state.out.duration(400).delay(30).to('-30%', 0, 0).end()
    } else {
      state.out.duration(400).to(0, 0, 0).scale(1 - controls.backdropReducedScale).end()
    }
    await controls?.show()
    return Promise.resolve(false)
  } else {
    if (state.applets[1].controls?.visibility === true) {
      if (swipeTransitionType === 'slide') {
        await state.in.duration(0).to('-30%', 0, 0).end()
        state.in.duration(400).to(0, 0, 0).end()
      } else {
        await state.in.duration(0).to(0, 0, 0).scale(1 - controls.backdropReducedScale).end()
        state.in.duration(400).to(0, 0, 0).scale(1).end()
      }
      await controls?.hide()
    }
    return Promise.resolve(false)
  }
}
