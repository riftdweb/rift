import { createLogger } from './logger'

type Params = {
  capacity?: number
  processingInterval?: number
  ratePerMinute?: number
}

type TaskParams = {
  cost?: number
  prioritize?: boolean
}

type Task<T> = {
  task: () => Promise<T>
  cost: number
  prioritize: boolean
  resolve: (value: T | PromiseLike<T>) => void
  reject: () => void
}

const defaultParams = {
  capacity: 1,
  processingInterval: 2_000,
  ratePerMinute: 60,
}

export function RateLimiter(namespace: string, params: Params = {}) {
  const { capacity, processingInterval, ratePerMinute } = {
    ...defaultParams,
    ...params,
  }

  const log = createLogger(`${namespace}/Limiter`)

  // queue
  const queue: Task<any>[] = []
  let tasksInflight = 0

  // rate limiting
  let tokens = ratePerMinute
  let lastFilled = Math.floor(Date.now() / 1000)
  let fillPerSecond = ratePerMinute / 60

  // metrics
  let completedTaskLog: [number, number][] = []

  let interval = null

  const getNextTaskIndex = (): number => {
    if (queue.length === 0) {
      return -1
    }
    const i = queue.findIndex((task) => task.prioritize)
    return ~i ? i : 0
  }

  const peekNextTask = (): Task<any> | undefined => {
    const index = getNextTaskIndex()
    if (!~index) {
      return undefined
    }
    return queue[index]
  }

  const getNextTask = (): Task<any> | undefined => {
    const index = getNextTaskIndex()
    if (!~index) {
      return undefined
    }
    return queue.splice(index, 1)[0]
  }

  const canProcessNextTask = () => {
    const task = peekNextTask()
    if (!task) {
      return false
    }
    return tokens >= task.cost
  }

  const processNextTask = async () => {
    let isTerminating = false

    const task = getNextTask()

    tasksInflight += 1
    tokens -= task.cost

    if (queue.length === 0 && interval) {
      clearInterval(interval)
      interval = null
      isTerminating = true
    }

    const result = await task.task()
    completedTaskLog.push([new Date().getTime(), task.cost])
    // log('Task complete')

    if (isTerminating && !interval) {
      // log('Task queue terminated')
    }

    task.resolve(result)
    tasksInflight -= 1
  }

  const refillTokens = () => {
    const now = Math.floor(Date.now() / 1000)

    const refill = (now - lastFilled) * fillPerSecond
    tokens = Math.min(capacity, tokens + refill)

    lastFilled = now
  }

  const getActualRatePerMinute = () => {
    const now = new Date().getTime()
    const secondsAgo60 = now - 1000 * 60

    const validIndex = completedTaskLog.findIndex(
      ([time]) => time > secondsAgo60
    )

    if (~validIndex) {
      completedTaskLog.splice(0, validIndex)
    } else {
      completedTaskLog = []
    }

    return completedTaskLog.reduce((acc, [_, cost]) => acc + cost, 0)
  }

  const processQueue = async () => {
    refillTokens()

    if (queue.length && canProcessNextTask()) {
      log(
        'Pending',
        tasksInflight,
        'Queue',
        queue.length,
        'Tokens',
        tokens,
        'r/m',
        getActualRatePerMinute()
      )
    }

    while (queue.length && canProcessNextTask()) {
      processNextTask()
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
  async function add<T>(
    task: () => Promise<T>,
    params: TaskParams = {}
  ): Promise<T> {
    const { prioritize = false, cost = 1 } = params

    assertRunning()
    return new Promise((resolve, reject) => {
      queue.push({
        task,
        resolve,
        reject,
        cost,
        prioritize,
      })
    })
  }

  // // Prepend task to the beginning of the queue
  // async function prepend<T>(
  //   task: () => Promise<T>,
  //   params: TaskParams = {}
  // ): Promise<T> {
  //   const { cost = 1 } = params
  //   assertRunning()
  //   return new Promise((resolve, reject) => {
  //     queue.unshift({
  //       task,
  //       resolve,
  //       reject,
  //       cost,
  //     })
  //     while (maxQueueSize && queue.length > maxQueueSize) {
  //       log('Dropping task from the back')
  //       queue.pop()
  //     }
  //   })
  // }

  // async function add<T>(
  //   task: () => Promise<T>,
  //   params: TaskParams = {}
  // ): Promise<T> {
  //   const { prioritize = false } = params
  //   if (prioritize) {
  //     return prepend(task, params)
  //   } else {
  //     return append(task, params)
  //   }
  // }

  return {
    queue,
    add,
  }
}
