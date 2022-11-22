import { SegueSwitch } from './Switch'
import { SegueOptions } from '../types'
class Segue extends SegueSwitch {
  public setup(options: SegueOptions): void {
    this.options = options
  }
}

export {
  Segue
}
