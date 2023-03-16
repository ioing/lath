import { SegueAnimateState } from '../../types'

export default async (state: SegueAnimateState) => {
  const applet = state.applets[state.reverse ? 1 : 0]
  const modality = applet.modality
  if (!modality) return Promise.resolve(false)
  if (!state.reverse) {
    await state.view[0].animate({
      backfaceVisibility: 'hidden',
      transform: `translate3d(0, 0, 500px) scale(1)`,
      transformOrigin: origin
    }, {
      duration: 0,
      fill: 'forwards'
    }).finished
    await modality.rise()
    return Promise.resolve(false)
  } else {
    if (modality?.visibility === true) {
      await modality?.fall()
    }
    return Promise.resolve(false)
  }
}
