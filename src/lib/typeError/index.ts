async function getMessage(code: number, args: string[]) {
  let ErrorCode
  try {
    ({ ErrorCode } = await import('./errorCode'))
  } catch (error) {
    console.warn(error)
    return {
      ErrorCode: {}
    }
  }
  const message = ErrorCode[code]
  if (message && args) {
    return String.raw({
      raw: message.split('[$]')
    }, ...args)
  }
  return message ?? 'unknown'
}

export default async (code: number, type: 'error' | 'info' | 'warn' | 'return' = 'error', ...args: string[]) => {
  const message = await getMessage(code, args)
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
