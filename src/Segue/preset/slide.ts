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
        await state.in.duration(0).filter('brightness(0.9)').to(inX * .1, inY * .1, 0).end()
      } else {
        await state.in.duration(0).filter('brightness(0.9)').scale(1 - backdropReducedScale).end()
      }
      await Promise.all([
        state.out.duration(duration).ease('ease-out-expo').to(outX, outY, 0).end(),
        state.in.duration(duration).ease('ease-out-expo').filter('brightness(1)').to(0, 0, 0).scale(1).end()
      ])
    } else {
      await state.in.duration(0).to(inX, inY, 0).end()
      await Promise.all([
        state.in.duration(duration).ease('ease-out-expo').to(0, 0, 100).end(),
        swipeTransitionType === 'slide'
          ? state.out.duration(duration).ease('ease-out-expo').filter('brightness(0.9)').to(outX * .3, outY * .3, 0).end()
          : state.out.duration(duration).ease('ease-out-expo').filter('brightness(0.9)').scale(1 - backdropReducedScale).end()
      ])
    }
    return Promise.resolve(false)
  }
}
