interface TimerLog {
  [key: number]: boolean
}

interface TimerState {
  timerLog: TimerLog
  timerId: number
}

interface IntervalLog {
  [key: number]: IntervalState
}

interface IntervalState {
  timerId: number
  intervalId: number
}

const getTimerHandler = (handler: TimerHandler, appletWindow: Window, timerState: TimerState, stretch?: boolean) => {
  return () => {
    const run = () => {
      if (timerState.timerLog[timerState.timerId] === undefined) return
      if (typeof handler === 'function') {
        handler()
      } else if (typeof handler === 'string') {
        const evalHandle = new appletWindow.Function(`return ${handler}`)
        evalHandle()
      }
      delete timerState.timerLog[timerState.timerId]
    }
    // first render
    if (appletWindow.document.readyState !== 'complete') {
      run()
      return
    }
    // global scope
    if (appletWindow === window) {
      if (window.applicationActiveState !== 'frozen') {
        run()
      } else if (stretch) {
        window.addEventListener('message', (event: MessageEvent) => {
          if (event.data?.type === 'application-active') run()
        })
      }
      return
    }
    // applet scope
    if (appletWindow.appletVisibilityState === 'visible') {
      run()
    } else if (stretch) {
      appletWindow.addEventListener('message', (event: MessageEvent) => {
        if (event.data?.type === 'applet-show') run()
      })
    }
  }
}
export const smartSetTimeout = (appletWindow: Window): void => {
  const realSetTimeout = appletWindow.setTimeout
  const realClearTimeout = appletWindow.clearTimeout
  const realSetInterval = appletWindow.setInterval
  const realClearInterval = appletWindow.clearInterval

  const timerLog: TimerLog = {}
  appletWindow.setBackgroundTimeout = realSetTimeout
  appletWindow.setTimeout = (handler: TimerHandler, timeout?: number | undefined, ...args: unknown[]) => {
    const timerState = {
      timerLog,
      timerId: -1
    }
    const fn = getTimerHandler(handler, appletWindow, timerState, true)
    const intervalId = realSetTimeout(fn, timeout, ...args)
    timerLog[intervalId] = true
    timerState.timerId = intervalId
    return intervalId
  }
  appletWindow.clearTimeout = (...args) => {
    const timeoutID = args[0]
    if (timeoutID) {
      delete timerLog[timeoutID]
    }
    return realClearTimeout(...args)
  }
  appletWindow.setTimeout.toString = () => 'setTimeout() { [native code] }'
  appletWindow.clearTimeout.toString = () => 'clearTimeout() { [native code] }'

  // smartSetInterval
  const intervalLog: IntervalLog = {}
  appletWindow.setBackgroundInterval = realSetInterval
  appletWindow.setInterval = (handler: TimerHandler, timeout?: number | undefined, ...args: unknown[]) => {
    const timerState: IntervalState = {
      timerId: -1,
      intervalId: -1
    }
    const nextHandler = () => {
      if (timerState.timerId !== -1 && !intervalLog[timerState.intervalId]) return
      if (typeof handler === 'function') {
        handler()
      } else if (typeof handler === 'string') {
        const evalHandle = new appletWindow.Function(`return ${handler}`)
        evalHandle()
      }
      timerState.timerId = appletWindow.setTimeout(nextHandler, timeout, ...args)
    }
    const intervalId = timerState.intervalId = timerState.timerId = appletWindow.setTimeout(nextHandler, timeout, ...args)
    intervalLog[intervalId] = timerState

    return intervalId
  }
  appletWindow.clearInterval = (...args) => {
    const timeoutID = args[0]
    if (!timeoutID) return
    realClearInterval(timeoutID)
    const timerState = intervalLog[timeoutID]
    if (timerState) {
      appletWindow.clearTimeout(timerState.timerId)
      delete intervalLog[timerState.intervalId]
    }
  }
  appletWindow.setInterval.toString = () => 'setInterval() { [native code] }'
  appletWindow.clearInterval.toString = () => 'clearInterval() { [native code] }'
}
