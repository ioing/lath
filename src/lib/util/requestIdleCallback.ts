import setTimeout from "./setTimeout"

export default window.requestIdleCallback || ((callback: IdleRequestCallback, options?: IdleRequestOptions | undefined) => {
  const start = Date.now()
  return setTimeout(function () {
    callback({
      didTimeout: false,
      timeRemaining: function () {
        return Math.max(0, 50 - (Date.now() - start))
      }
    })
  }, Math.min(options?.timeout ?? 1, 1))
})
