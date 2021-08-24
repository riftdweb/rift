export const wait = (delay: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, delay)
  })

type Params = {
  log?: (message: string) => void
  resourceName?: string
  intervalTime?: number
}

const defaultParams = {
  intervalTime: 100,
}

function isDone(func: () => any[]) {
  const parts = func()
  const index = parts.findIndex((part) => !part)
  return !~index
}

export const waitFor = (func: () => any[], params: Params = {}) =>
  new Promise<void>((resolve) => {
    const { log, intervalTime, resourceName } = {
      ...defaultParams,
      ...params,
    }

    if (isDone(func)) {
      resolve()
      return
    }

    let interval = null
    let i = 1
    interval = setInterval(() => {
      if (isDone(func)) {
        clearInterval(interval)
        log(`Done after ${i}`)
        resolve()
      } else {
        if (log) {
          if (resourceName) {
            log(`Waiting on ${resourceName} ${i}`)
          } else {
            log(`Waiting ${i}`)
          }
        }
        i += 1
      }
    }, intervalTime)
  })
