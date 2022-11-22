export function getCSSUnits(value?: string | number): string | undefined {
  if (!value) return
  if (typeof value === 'string') return value
  return value + 'px'
}

export default getCSSUnits
