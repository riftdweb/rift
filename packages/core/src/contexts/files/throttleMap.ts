import { throttle } from 'lodash'

export function ThrottleMap(interval: number = 200) {
  const funcMap = {}

  return function call(key: string, func: () => void) {
    let throttleFunc = funcMap[key]
    if (!throttleFunc) {
      throttleFunc = throttle((f) => f(), interval)
      funcMap[key] = throttleFunc
    }
    return throttleFunc(func)
  }
}
