import { SegueAnimateState } from '../../types'

export default (type: number) => {
  return async (state: SegueAnimateState) => {
    let inO: number, outO: number, inV: HTMLElement, outV: HTMLElement
    switch (type) {
      case 0:
        inO = 1
        outO = 0
        inV = state.view[0]
        outV = state.view[1]
        break
      case 1:
      default:
        inO = 0
        outO = 1
        inV = outV = state.view[0]
    }
    await inV.animate({ transform: `translate3d(0, 0, 0)`, opacity: inO }, {
      duration: 0,
      easing: 'linear',
      fill: 'forwards'
    }).finished
    await outV.animate({ transform: `translate3d(0, 0, 0)`, opacity: outO }, {
      duration: 300,
      easing: 'linear',
      fill: 'forwards'
    }).finished
    return Promise.resolve(false)
  }
}
