import setTimeout from "./setTimeout"

export default (delay = 0) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay)
  })
}