import { createLogger } from './logger'
import { v4 as uuid } from 'uuid'
import { taskQueueRegistry } from './taskQueue'

type Params = {
  capacity?: number
  processingInterval?: number
  ratePerMinute?: number
}

type TaskParams = {
  name: string
  cost?: number
  priority?: number
}

type Task<T> = {
  id: string
  name: string
  task: () => Promise<T>
  cost: number
  priority: number
  resolve: (value: T | PromiseLike<T>) => void
  reject: () => void
}

const defaultParams = {
  capacity: 1,
  processingInterval: 2_000,
  ratePerMinute: 60,
}

type IRateLimiter<T> = {
  name: string
  add: <T>(task: () => Promise<T>, params: TaskParams) => Promise<T>
  queue: Task<T>[]
  pendingQueue: Task<T>[]
}

export function RateLimiter<T>(
  name: string,
  params: Params = {}
): IRateLimiter<T> {
  const { capacity, processingInterval, ratePerMinute } = {
    ...defaultParams,
    ...params,
  }

  const log = createLogger(`${name}/Limiter`)

  // queue
  const queue: Task<any>[] = []
  const pendingQueue: Task<any>[] = []

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
    const { index } = queue.reduce(
      (acc, task, i) => {
        if (task.priority > acc.priority) {
          return {
            index: i,
            priority: task.priority,
          }
        }
        return acc
      },
      {
        index: 0,
        priority: 0,
      }
    )
    return index
  }

  const peekNextTask = (): Task<any> | undefined => {
    const index = getNextTaskIndex()
    if (!~index) {
      return undefined
    }
    return queue[index]
  }

  const popNextTask = (): Task<any> | undefined => {
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

    const task = popNextTask()
    const id = task.id

    pendingQueue.push(task)
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
    const index = pendingQueue.findIndex((task) => task.id === id)
    pendingQueue.splice(index, 1)
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
        pendingQueue.length,
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

  async function add<T>(
    task: () => Promise<T>,
    params: TaskParams
  ): Promise<T> {
    const { name, priority = 0, cost = 1 } = params
    const id = uuid()

    assertRunning()
    return new Promise((resolve, reject) => {
      queue.push({
        id,
        name,
        task,
        resolve,
        reject,
        cost,
        priority,
      })
    })
  }

  const values = {
    name,
    queue,
    pendingQueue,
    add,
  }

  taskQueueRegistry[name] = values

  return values
}
