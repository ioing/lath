import getIOSVersion from './getIOSVersion'

/**
 * supported ios (> 15)
 */
function testHasSnapReset() {
  const iosVersion = getIOSVersion()
  if (iosVersion && iosVersion[0] < 15) {
    return true
  }
  return false
}

export default testHasSnapReset
