import { SegueAnimateState, Animate } from '../../types'

export default (type: number) => {
  return (state: SegueAnimateState) => {
    let inO: number, outO: number, inV: Animate, outV: Animate
    switch (type) {
      case 0:
        inO = 1
        outO = 0
        inV = state.in
        outV = state.out
        break
      case 1:
      default:
        inO = 0
        outO = 1
        inV = outV = state.in
    }
    inV.duration(0).ease('ease-out-expo').to(0, 0, 0).opacity(inO).end(function () {
      outV.duration(767).opacity(outO).end(function () {
        state.callback(false)
      })
    })
    return undefined
  }
}
