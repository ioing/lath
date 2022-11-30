import { SegueAnimateState, Animate } from '../../types'

export default (type: number) => {
  return async (state: SegueAnimateState) => {
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
    await inV.duration(0).ease('ease-out-expo').to(0, 0, 0).opacity(inO).end()
    await outV.duration(767).opacity(outO).end()
    return Promise.resolve(false)
  }
}
