import testHasSmoothScrolling from "./testHasSmoothScrolling"

function testHasSmoothSnapScrolling(): boolean {
  if ('scrollSnapAlign' in document.documentElement.style ||
    'webkitScrollSnapAlign' in document.documentElement.style ||
    'msScrollSnapAlign' in document.documentElement.style
  ) {
    if (testHasSmoothScrolling()) {
      return true
    }
  }
  return false
}

export default testHasSmoothSnapScrolling
