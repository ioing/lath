import { SegueAnimateState } from '../../types'

export default async (state: SegueAnimateState) => {
  const applet = state.applets[state.reverse ? 1 : 0]
  const prevApplet = state.applets[state.reverse ? 0 : 1]
  const modality = applet.modality
  const clipTop = applet.config.paperOptions?.clipTop || '0px'
  const paperTop = typeof clipTop === 'string' ? clipTop : clipTop + 'px'
  const { touches } = state
  const target = touches?.target
  const frameRect = target?.getBoundingClientRect()
  const frameX = frameRect?.x || 0
  const frameY = `calc(${(frameRect?.y || 0) + 'px'} - ${paperTop})`
  const frameWidth = frameRect?.width || '100%'
  const frameHeight = `calc(${frameRect?.height}px + ${paperTop})` || '100%'
  const iframeView = applet.view?.tagName === 'IFRAME' ? applet.view : null
  if (!modality) return Promise.resolve(false)
  if (prevApplet.modality && prevApplet.config?.sheetOptions?.alwaysPopUp !== false) {
    await prevApplet.modality.fall()
  }
  if (!state.reverse) {
    if (iframeView) {
      iframeView.style.willChange = 'min-width, min-height, width, height'
    }
    modality.freezeSnap()
    await state.in.duration(0).to(frameX, frameY, 500)
      .transformOrigin('center')
      .width(frameWidth).height(frameHeight)
      .style('min-width', '0px')
      .style('min-height', '0px')
      .style('box-shadow', '2px 4px 20px rgb(0, 0, 0, .2)')
      .style('will-change', 'transform, min-width, min-height, width, height, opacity')
      .borderRadius('16px')
      .opacity(0)
      .end()
    await state.in.duration(100).ease('ease-out-expo').to(frameX, frameY, 500).opacity(1).end()
    await state.in.duration(600).ease('ease-out-expo').to(0, 0, 500).width('100%').height('100%').borderRadius('0px').end()
    await modality.rise()
    await state.in.duration(100).to(0, 0, 500)
      .style('min-width', '100%')
      .style('min-height', '100%')
      .style('box-shadow', 'none')
      .style('will-change', 'none')
      .end()
    if (iframeView) {
      iframeView.style.willChange = 'none'
    }
    modality.activateSnap()
    return Promise.resolve(false)
  } else {
    if (modality?.visibility === true) {
      await modality?.fall()
    }
    return Promise.resolve(false)
  }
}
