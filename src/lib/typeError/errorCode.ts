const ErrorCode: ErrorCodeType = {
  1001: '<define-application> not found！Only call <define-applet> at the Top Level / inside loops, conditions, or nested functions.',
  1002: 'Avoid redefine \'applet-id\'! "[$]"',
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
  1107: 'Applet config: An unknown modality type was used.',
  1201: 'Applet has entered cross-domain mode, stopping the ability to inject.',
  1202: 'Shared window Applets (i.e. non-iframe) only support one-time execution of \'apply\' and \'inject\' methods. If you have the above configuration, merge it into the Frameworks Applet.'
}

export {
  ErrorCode
}