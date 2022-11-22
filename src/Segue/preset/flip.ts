import { SegueAnimateState } from '../../types'

export default (type: number) => {
  return (state: SegueAnimateState) => {
    let reverse = (type === 1 || type === 2) ? !state.reverse : state.reverse
    let ease = 'ease-out-expo'
    let inOrigin = 'center'
    let outOrigin = 'center'
    let inX = '100%'
    let outX = '-100%'
    let inY = '0'
    let outY = '0'
    let inRotateY = 90
    let outRotateY = -90
    let inRotateX = 0
    let outRotateX = 0
    let duration = 800
    switch (type) {
      case 0:
      case 2:
        if (type === 2) reverse = !reverse
        inOrigin = reverse ? 'center bottom' : 'center top'
        outOrigin = reverse ? 'center top' : 'center bottom'
        inRotateY = 0
        outRotateY = 0
        inRotateX = reverse ? 90 : -90
        outRotateX = reverse ? -90 : 90
        inX = '0'
        outX = '0'
        inY = reverse ? '-100%' : '100%'
        outY = reverse ? '100%' : '-100%'
        break
      case 1:
      case 3:
        inOrigin = reverse ? 'center right' : 'center left'
        outOrigin = reverse ? 'center left' : 'center right'
        inRotateY = reverse ? -90 : 90
        outRotateY = reverse ? 90 : -90
        inX = reverse ? '-100%' : '100%'
        outX = reverse ? '100%' : '-100%'
        break
      case 4:
        ease = 'ease-out-expo'
        duration = 1200
        inOrigin = 'center'
        outOrigin = 'center'
        inRotateY = reverse ? -180 : 180
        outRotateY = reverse ? 180 : -180
        inX = '0'
        outX = '0'
        break
    }
    state.in.duration(0).ease(ease).perspective(3000).transformOrigin(inOrigin).to(inX, inY, 0).backface(false).rotateY(inRotateY).rotateX(inRotateX).end(() => {
      state.in.duration(duration).to(0, 0, 0).rotateY(0).rotateX(0).end(() => {
        state.callback(false)
      })
      state.out.duration(duration).ease(ease).perspective(3000).transformOrigin(outOrigin).to(outX, outY, 0).backface(false).rotateY(outRotateY).rotateX(outRotateX).end()
    })
    return undefined
  }
}
