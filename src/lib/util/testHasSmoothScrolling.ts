function testHasSmoothScrolling(): boolean {
  const testDom = document.createElement('div')
  testDom.style.scrollBehavior = 'smooth'
  if (testDom.style.cssText.indexOf('smooth') === -1) {
    return false
  }
  return CSS.supports('scroll-behavior', 'smooth')
}

export default testHasSmoothScrolling