import { SegueAnimateState } from '../../types'

export default (type: number) => {
  return (state: SegueAnimateState) => {
    let inX = 0
    let outX = 0
    let inY = 0
    let outY = 0
    const duration = 767

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
      state.in.duration(0).filter('brightness(0.9)').to(inX * .1, inY * .1, 0).end(() => {
        state.out.duration(duration).ease('ease-out-expo').to(outX, outY, 0).end()
        state.in.duration(duration).ease('ease-out-expo').filter('brightness(1)').to(0, 0, 0).end(() => {
          state.callback(false)
        })
      })
    } else {
      state.in.duration(0).to(inX, inY, 0).end(() => {
        state.in.duration(duration).ease('ease-out-expo').to(0, 0, 0).end(() => {
          state.callback(false)
        })
        state.out.duration(duration).ease('ease-out-expo').filter('brightness(0.9)').to(outX * .5, outY * .5, 0).end()
      })
    }
    return undefined
  }
}
