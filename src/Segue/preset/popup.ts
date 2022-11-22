import { SegueAnimateState } from '../../types'

export default async (state: SegueAnimateState) => {
  const applet = state.applets[state.reverse ? 1 : 0]
  const prevApplet = state.applets[state.reverse ? 0 : 1]
  const modality = applet.modality
  if (!modality) return Promise.resolve(false)
  if (prevApplet.modality) {
    await prevApplet.modality.fall()
  }
  if (!state.reverse) {
    await state.in.duration(0).to(0, 0, 500).scale(1).end()
    await modality.rise()
    return Promise.resolve(false)
  } else {
    if (modality?.visibility === true) {
      await modality?.fall()
    }
    return Promise.resolve(false)
  }
}
