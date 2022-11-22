export function getIOSversion(): number[] | null {
  if (/(iPhone|iPod|iPad)/i.test(navigator.userAgent)) {
    // supports iOS 2.0 and later
    const v = (navigator.userAgent).match(/OS (\d+)_(\d+)_?(\d+)?/)
    if (!v) return [0]
    return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || '0', 10)]
  }
  return null
}

export default getIOSversion
