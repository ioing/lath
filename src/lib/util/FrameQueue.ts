import requestAnimationFrame from "./requestAnimationFrame"
import { FrameElapsedDuration } from './FrameElapsedDuration'

type FrameFn = (frameAverageDuration: number, framesQueuesLength: number) => Promise<void>

class FrameQueue {
  private queue: FrameFn[] = []
  private inProgress = false
  private averageDuration = new FrameElapsedDuration()
  public pushState<T extends FrameFn>(frameFn: T) {
    this.queue.push(frameFn)
  }
  public run() {
    if (this.inProgress) return
    this.inProgress = true
    requestAnimationFrame(() => {
      requestAnimationFrame(this.step.bind(this))
    })
  }
  public async step(timestamp: number) {
    const frameFn = this.queue.shift()
    if (frameFn) {
      await frameFn(this.averageDuration.getElapsed(timestamp), this.queue.length)
    }
    if (!this.queue.length) {
      this.inProgress = false
    } else {
      requestAnimationFrame(this.step.bind(this))
    }
  }
  public clear() {
    this.queue = []
  }
}

export {
  FrameQueue
}
