type ErrorCodeType = {
  [key: number]: string
}

const ErrorCode: ErrorCodeType = {
  1001: '<define-application> not found！Only call <define-applet> at the Top Level / inside loops, conditions, or nested functions.',
  1002: 'Cannot redefine \'applet-id\'!',
  1003: 'Only call <define-applet> at the Top Level / inside loops, conditions, or nested functions.',
  1004: 'Non-changeable \'default-applet\'!',
  1005: '<define-application> execution exception! Maybe the browser version is not supported.',
  1006: 'The defined applet(\'defaultApplet\') could not be found!',
  1007: '\'FrameworksApplet\' must be included!',
  1008: 'Unable to get applet with id "[$]".',
  1101: 'Applet config: Applets(id == frameworks/system) applets do not need to configured with [free].',
  1102: 'Applet config: Applets(id == frameworks/system) do not need to configured with [source].',
  1103: 'Applet config: [free & portal] conflict! [free] must be true when [portal] sets true.',
  1104: 'Applet config: [level] needs to be less than 9999!',
  1105: 'Applet config: [modality] applets do not need to configured with [animation].',
  1106: 'Applet config: Using the "sheet" animation type requires setting the modality to "sheet".',
  1107: 'Applet config: An unknown modality type was used.'
}

function getMessage(code: number, args: string[]) {
  const message = ErrorCode[code]
  if (message && args) {
    return String.raw({
      raw: message.split('[$]')
    }, ...args)
  }
  return message ?? 'unknown'
}

export default (code: number, type: 'error' | 'info' | 'warn' | 'return' = 'error', ...args: string[]) => {
  const message = getMessage(code, args)
  if (type === 'return') {
    return message
  }
  if (type === 'error') {
    console.error('LATH Error:', message)
  } else if (type === 'info') {
    console.info('LATH Info:', message)
  } else if (type === 'warn') {
    console.warn('LATH Warning:', message)
  }

}
