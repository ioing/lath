import testHasSmoothScrolling from "./testHasSmoothScrolling"
import getIOSVersion from './getIOSVersion'

/**
 * -webkit-overflow-scrolling
 * supported ios (5-12.5)
 */
function testHasScrolling() {
  const iosVersion = getIOSVersion()
  if (iosVersion && iosVersion[0] < 13 && !testHasSmoothScrolling()) {
    return false
  }
  return true
}

export default testHasScrolling
