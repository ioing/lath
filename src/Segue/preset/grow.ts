import EASE from '../../lib/webAnimations/ease'
import { SegueAnimateState } from '../../types'

export default async (state: SegueAnimateState) => {
  const applet = state.applets[state.reverse ? 1 : 0]
  const modality = applet.modality
  const clipTop = applet.config.paperOptions?.clipTop || '0px'
  const paperTop = typeof clipTop === 'string' ? clipTop : clipTop + 'px'
  const { touches } = state
  const target = touches?.target
  const frameRect = target?.getBoundingClientRect()
  const frameX = (frameRect?.x || 0) + 'px'
  const frameY = `calc(${(frameRect?.y || 0) + 'px'} - ${paperTop})`
  const frameWidth = frameRect?.width !== undefined ? frameRect?.width + 'px' : '100%'
  const frameHeight = `calc(${frameRect?.height}px + ${paperTop})` || '100%'
  const iframeView = applet.view?.tagName === 'IFRAME' ? applet.view : null
  if (!modality) return Promise.resolve(false)
  if (!state.reverse) {
    if (iframeView) {
      iframeView.style.willChange = 'min-width, min-height, width, height'
    }
    state.view[0].style.willChange = 'transform, min-width, min-height, width, height, opacity'
    modality.freezeSnap()
    await state.view[0].animate({
      transform: `translate3d(${frameX}, ${frameY}, 500px)`,
      transformOrigin: 'center',
      backfaceVisibility: 'hidden',
      width: frameWidth,
      height: frameHeight,
      minWidth: '0px',
      minHeight: '0px',
      boxShadow: '2px 4px 20px rgb(0, 0, 0, .2)',
      borderRadius: '16px',
      opacity: 0
    }, {
      duration: 0,
      fill: 'forwards'
    }).finished
    // (delete await) Reduce low-end device animation jank.
    state.view[0].animate({
      opacity: 1
    }, {
      duration: 100,
      easing: EASE['ease-out-expo'],
      fill: 'forwards'
    }).play()
    await state.view[0].animate({
      transform: `translate3d(0px, 0px, 500px)`,
      width: '100%',
      height: '100%',
      borderRadius: '0px'
    }, {
      duration: 600,
      easing: EASE['ease-out-expo'],
      fill: 'forwards'
    }).finished
    await modality.rise()
    await state.view[0].animate({
      minWidth: '100%',
      minHeight: '100%',
      boxShadow: 'none',
      borderRadius: '0px'
    }, {
      duration: 100,
      easing: EASE['ease-out-expo'],
      fill: 'forwards'
    }).finished
    if (iframeView) {
      iframeView.style.willChange = 'none'
    }
    state.view[0].style.willChange = 'none'
    modality.activateSnap()
    return Promise.resolve(false)
  } else {
    if (modality?.visibility === true) {
      await modality?.fall()
    }
    return Promise.resolve(false)
  }
}
