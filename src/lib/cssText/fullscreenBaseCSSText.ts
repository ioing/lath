import { getEnv } from '../../Define/env'
const { USE_PERCENTAGE } = getEnv()

export const fullscreenBaseCSSText = `
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  width: ${USE_PERCENTAGE ? '100%' : '100vw'};
  height: ${USE_PERCENTAGE ? '100%' : '100vh'};
  min-width: ${USE_PERCENTAGE ? '100%' : '100vw'};
  min-height: ${USE_PERCENTAGE ? '100%' : '100vh'};
  max-width: ${USE_PERCENTAGE ? '100%' : '100vw'};
  max-height: ${USE_PERCENTAGE ? '100%' : '100vh'};
`

export const viewportBaseStatusCSSText = `
  filter: none;
  opacity: 1;
`