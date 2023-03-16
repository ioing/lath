import EASE from '../../lib/webAnimations/ease'
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
    await Promise.all([
      state.view[0].animate([
        {
          transform: `translate3d(0, 0, 0) rotate3d(${rx}, ${ry}, 0, ${rotate * direction}deg) perspective(1000px) scale(${minScale})`,
          backfaceVisibility: 'hidden',
          transformOrigin: origin
        },
        {
          transformOrigin: origin,
          transform: `rotate3d(${rx}, ${ry}, 0, 0deg) perspective(1000px) scale(1)`,
        }
      ], {
        delay: inDelay,
        duration,
        easing: EASE['ease-out-expo'],
        fill: 'forwards'
      }).finished,
      state.view[1].animate({
        backfaceVisibility: 'hidden',
        transform: `rotate3d(${rx}, ${ry}, 0, ${-rotate * direction}deg) perspective(1000px) scale(${minScale})`,
        transformOrigin: origin
      }, {
        delay: inDelay,
        duration,
        easing: EASE['ease-out-expo'],
        fill: 'forwards'
      }).finished
    ])
    await state.view[1].animate({
      transform: `rotate3d(${rx}, ${ry}, 0, ${-rotate * direction}deg) perspective(1000px) scale(${minScale})`,
      transformOrigin: origin
    }, {
      duration: 0,
      easing: EASE['ease-out-expo'],
      fill: 'forwards'
    }).finished
    prevApplet.controls?.prepare()
    return Promise.resolve(false)
  }
}
