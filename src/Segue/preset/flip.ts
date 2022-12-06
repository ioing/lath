import { SegueAnimateState } from '../../types'

export default (type: number) => {
  return async (state: SegueAnimateState) => {
    let origin = 'center'
    let minScale = 0.3
    let rotate = 150
    let duration = 1200
    let inDelay = duration / 8
    let rx = 0
    let ry = 1
    const direction = state.direction * (state.reverse ? -1 : 1)
    const prevApplet = state.applets[state.historyDirection === 1 ? 1 : 0]
    switch (type) {
      case 0:
        origin = 'top'
        rx = 1
        ry = 0
        duration = 1400
        inDelay = duration / 8
        break
      case 1:
        origin = 'right'
        break
      case 2:
        origin = 'bottom'
        rx = 1
        ry = 0
        duration = 1400
        inDelay = duration / 8
        break
      case 3:
        rotate = -150
        origin = 'left'
        break
      case 4:
        origin = 'center'
        rotate = 180
        minScale = 0.7
        duration = 1200
        inDelay = 0
        break
    }
    prevApplet.controls?.prepare(true)
    await state.in.duration(0).ease('ease-out-expo').perspective(1000).transformOrigin(origin).to(0, 0, 0).backface(false).rotate3d(rx, ry, 0, rotate * direction).scale(minScale).end()
    await Promise.all([
      state.in.delay(inDelay).duration(duration).backface(false).rotate3d(rx, ry, 0, 0).scale(1).end(),
      state.out.duration(duration).ease('ease-out-expo').perspective(1000).transformOrigin(origin).backface(false).rotate3d(rx, ry, 0, -rotate * direction).scale(minScale).end()
    ])
    await state.out.duration(0).backface(false).rotate3d(rx, ry, 0, -rotate * direction).end()
    prevApplet.controls?.prepare()
    return Promise.resolve(false)
  }
}
