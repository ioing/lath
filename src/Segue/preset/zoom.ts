import { SegueAnimateState } from '../../types'

export default (type: number) => {
  return (state: SegueAnimateState) => {
    switch (type) {
      case 0:
        state.in.transformOrigin(state.attach).filter('brightness(0.5)').ease('ease-out-expo').duration(0).to(0, 0, 0).scale(2.5).end(() => {
          const actionOrigin = state.applets[1].getActionOrigin()
          const origin = actionOrigin ? [actionOrigin.x, actionOrigin.y] : state.origin
          state.out.transformOrigin(origin).ease('ease-out-expo').duration(767).scale(0.0001).end(() => {
            state.out.transformOrigin(origin).ease('ease').duration(10).scale(0.0001).opacity(0).end(() => {
              state.callback(false)
            })
          })
          state.in.duration(767).filter('brightness(1)').to(0, 0, 0).scale(1).end()
        })
        break
      case 1:
        state.in.transformOrigin(state.origin).ease('ease-out-expo').duration(0).to(0, 0, 0).scale(0).end(() => {
          state.out.transformOrigin(state.attach).ease('ease-out-expo').filter('brightness(1)').duration(0).to(0, 0, 0).scale(1).end(() => {
            state.in.duration(767).to(0, 0, 0).scale(1).end()
            state.out.duration(767).scale(2.5).filter('brightness(0.5)').end(() => {
              state.callback(false)
            })
          })
        })
        break
    }
    return undefined
  }
}
