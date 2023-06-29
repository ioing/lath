import typeError from '../lib/typeError'
import getIOSversion from '../lib/util/getIOSVersion'
import { AppletManifest, FrameworksAppletConfig, AppletApplyOptions } from '../types'

export default (manifest: AppletManifest, id: string): AppletManifest => {
  const config = manifest.config
  if (id === 'frameworks' || id === 'system') {
    if (config.free) {
      typeError(1101, 'warn')
    }
    if (config.source?.html || config.source?.src) {
      typeError(1102, 'warn')
    }
  }
  if (config.portal) {
    if (!config.free) {
      typeError(1103, 'warn')
    }
  }
  if ((config.level ?? 0) > 10000) {
    typeError(1104, 'warn')
  }
  if (id !== 'frameworks' && (config.source?.html || config.source?.src)) {
    if (config.apply) {
      typeError(1202, 'warn')
    }
  } else {
    const defaultApply: AppletApplyOptions = ['smart-setTimeout', 'proxy-link', 'tap-highlight']
    const { apply = defaultApply, unApply } = config
    config.apply = apply
    if (unApply?.length) {
      config.apply = apply?.filter((item) => !unApply.includes(item))
    }
  }
  if (config.modality?.indexOf('sheet') === 0) {
    if (config.animation) {
      typeError(1105, 'warn')
    }
    config.animation = 'popup'
  } else if (config.animation === 'popup') {
    config.modality = 'sheet'
    typeError(1106, 'warn')
  }
  if (config.modality) {
    if (config.modality?.indexOf('paper') === 0) {
      if (config.animation) {
        typeError(1105, 'warn')
      }
      const { maskOpacity, swipeClosable } = config.paperOptions || { maskOpacity: 0.5 }
      config.animation = 'grow'
      config.sheetOptions = {
        stillBackdrop: true,
        noHandlebar: true,
        maskOpacity,
        swipeClosable,
        borderRadius: '0px',
        top: '0px'
      }
    } else if (config.modality?.indexOf('overlay') === 0) {
      if (config.animation) {
        typeError(1105, 'warn')
      }
      if (!config.color) {
        config.color = 'transparent'
      }
      const { maskOpacity, swipeClosable } = config.overlayOptions || { maskOpacity: 0.5 }
      config.animation = 'popup'
      config.sheetOptions = {
        stillBackdrop: true,
        noHandlebar: true,
        maskOpacity,
        swipeClosable,
        borderRadius: '0px',
        top: '0px',
        useFade: true
      }
    }
    if (!config.sheetOptions) {
      config.sheetOptions = {}
    }
    if (!getIOSversion()) {
      config.sheetOptions.stillBackdrop = true
    }
  }
  // In scenes such as Tab, you should also close the left slide to exit when no animation is set, otherwise overlay layers will appear.
  if (!config.animation) {
    config.disableSwipeModel = true
  }
  if (!(config as FrameworksAppletConfig).swipeTransitionType) {
    (config as FrameworksAppletConfig).swipeTransitionType = (config as FrameworksAppletConfig).swipeTransitionType ?? (getIOSversion() ? 'slide' : 'zoom')
  }
  return manifest
}

