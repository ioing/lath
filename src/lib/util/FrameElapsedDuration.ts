class FrameElapsedDuration {
  public previousTimeStamp!: number
  getElapsed(timestamp: number) {
    if (!this.previousTimeStamp) this.previousTimeStamp = timestamp - 16.7
    const previousElapsed = Math.min(timestamp - this.previousTimeStamp, 70) / 2
    this.previousTimeStamp = timestamp

    return previousElapsed
  }
}

export {
  FrameElapsedDuration
}
