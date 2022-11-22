import { Application } from './index'
import { PushWindowOptions } from '../types'

export default (app: Application): void => {
  window.addEventListener('message', (event: MessageEvent) => {
    if (event.source === window) return
    const { action, data } = event.data
    switch (action) {
      case 'to':
        app.segue.to(data.applet, data.query, data.history)
        break
      case 'back':
        app.segue.back()
        break
      case 'forward':
        app.segue.forward()
        break
      case 'pushWindow':
        app.pushWindow(...(data as PushWindowOptions))
        break
    }
  })
  return
}
