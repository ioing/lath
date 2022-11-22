import { AppletView } from './View'
import { AppletManifest, Application } from '../types'

class Applet extends AppletView {
  constructor(id: string, model: AppletManifest, application: Application) {
    super(id, model, application)
    this.events.boot(this.self)
  }
}

export {
  Applet
}
