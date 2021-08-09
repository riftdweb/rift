import { createLogger } from './logger'

type Params = {
  capacity?: number
  maxQueueSize?: number
  processingInterval?: number
  ratePerMinute?: number
}

const defaultParams = {
  capacity: 1,
  processingInterval: 2_000,
  ratePerMinute: 60,
}

export function RateLimiter(namespace: string, params: Params = {}) {
  const { capacity, maxQueueSize, processingInterval, ratePerMinute } = {
    ...defaultParams,
    ...params,
  }

  const log = createLogger(`${namespace}/Limiter`)

  // queue
  const queue = []
  let tasksInflight = 0

  // rate limiting
  let tokens = ratePerMinute
  let lastFilled = Math.floor(Date.now() / 1000)
  let fillPerSecond = ratePerMinute / 60

  let tokenLog: number[] = []

  // metrics
  let completedTaskLog: number[] = []

  let interval = null

  const startNextTask = async () => {
    let isTerminating = false

    tasksInflight += 1
    tokens -= 1

    // log('Starting task')
    const task = queue.shift()

    tokenLog.push(new Date().getTime())

    if (queue.length === 0 && interval) {
      clearInterval(interval)
      interval = null
      isTerminating = true
    }

    const result = await task.task()
    completedTaskLog.push(new Date().getTime())
    // log('Task complete')

    if (isTerminating && !interval) {
      // log('Task queue terminated')
    }

    task.resolve(result)
    tasksInflight -= 1
  }

  const refillTokens = () => {
    const now = new Date().getTime()
    const secondsAgo60 = now - 1000 * 60

    const validIndex = tokenLog.findIndex((time) => time > secondsAgo60)

    if (~validIndex) {
      tokenLog.splice(0, validIndex)
    } else {
      tokenLog = []
    }

    console.log(now, secondsAgo60, tokenLog.length)
    // const lastMinuteTaskCount = tokenLog.length

    // log(lastMinuteTaskCount, ratePerMinute, tokens)
    // const refill = Math.max(0, ratePerMinute - lastMinuteTaskCount)
    // tokens = Math.min(capacity, tokens + refill)

    // lastFilled = now
  }

  const getTokenCount = () => {
    return Math.max(0, ratePerMinute - tokenLog.length)
  }

  const getActualRatePerMinute = () => {
    const now = new Date().getTime()
    const secondsAgo60 = now - 1000 * 60

    const validIndex = completedTaskLog.findIndex((time) => time > secondsAgo60)

    if (~validIndex) {
      completedTaskLog.splice(0, validIndex)
    } else {
      completedTaskLog = []
    }

    return completedTaskLog.length
  }

  const processQueue = async () => {
    refillTokens()

    if (queue.length) {
      log(
        'Pending',
        tasksInflight,
        'Queue',
        queue.length,
        'Tokens',
        getTokenCount(),
        'r/m',
        getActualRatePerMinute()
      )
    }

    while (queue.length && getTokenCount() >= 1) {
      startNextTask()
    }
  }

  const assertRunning = () => {
    if (interval) {
      return
    }

    log('Starting up')
    interval = setInterval(processQueue, processingInterval)
  }

  // Append task to the end of the queue
  async function append<T>(task: () => Promise<T>): Promise<T> {
    assertRunning()
    return new Promise((resolve, reject) => {
      queue.push({
        task,
        resolve,
        reject,
      })
      while (maxQueueSize && queue.length > maxQueueSize) {
        log('Dropping task from the front')
        queue.shift()
      }
    })
  }

  // Prepend task to the beginning of the queue
  async function prepend<T>(task: () => Promise<T>): Promise<T> {
    assertRunning()
    return new Promise((resolve, reject) => {
      queue.unshift({
        task,
        resolve,
        reject,
      })
      while (maxQueueSize && queue.length > maxQueueSize) {
        log('Dropping task from the back')
        queue.pop()
      }
    })
  }

  return {
    queue,
    append,
    prepend,
  }
}
