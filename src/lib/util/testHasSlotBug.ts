import getIOSVersion from './getIOSVersion'

function testHasSlotBug(): boolean {
  const iosVersion = getIOSVersion()
  if (iosVersion && iosVersion[0] <= 13) {
    return true
  }
  return false
}

export default testHasSlotBug
