import { createLogger } from './logger'

type Params = {
  poolSize?: number
  maxQueueSize?: number
  processingInterval?: number
}

type TaskParams = {
  cost?: number
  priority?: number
}

type Task<T> = {
  task: () => Promise<T>
  cost: number
  priority: number
  resolve: (value: T | PromiseLike<T>) => void
  reject: () => void
}

const defaultParams = {
  poolSize: 1,
  processingInterval: 2_000,
}

// TODO: Update to same priorty mechanic as ratelimiter

export function TaskQueue(namespace: string, params: Params = {}) {
  const { poolSize, maxQueueSize, processingInterval } = {
    ...defaultParams,
    ...params,
  }

  const log = createLogger(`${namespace}/TaskQueue`)

  // queue
  const queue: Task<any>[] = []
  let tasksInflight = 0

  // // rate limiting
  // let tokens = ratePerMinute
  // let lastFilled = Math.floor(Date.now() / 1000)
  // let fillPerSecond = ratePerMinute / 60

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

  const getLastTaskIndex = (): number => {
    if (queue.length === 0) {
      return -1
    }
    const { index } = queue.reduce(
      ({ priority }, task, i) => {
        // <= so that later in queue is selected when equal
        if (task.priority <= priority) {
          return {
            index: i,
            priority: task.priority,
          }
        }
      },
      {
        index: queue.length - 1,
        priority: 0,
      }
    )
    return index
  }

  // const peekNextTask = (): Task<any> | undefined => {
  //   const index = getNextTaskIndex()
  //   if (!~index) {
  //     return undefined
  //   }
  //   return queue[index]
  // }

  const popNextTask = (): Task<any> | undefined => {
    const index = getNextTaskIndex()
    if (!~index) {
      return undefined
    }
    return queue.splice(index, 1)[0]
  }

  const popLastTask = (): Task<any> | undefined => {
    const index = getLastTaskIndex()
    if (!~index) {
      return undefined
    }
    return queue.splice(index, 1)[0]
  }

  const canProcessNextTask = () => {
    // const task = peekNextTask()
    // if (!task) {
    //   return false
    // }
    // return tokens >= task.cost
    return tasksInflight < poolSize
  }

  const processNextTask = async () => {
    let isTerminating = false

    const task = popNextTask()

    tasksInflight += 1
    // tokens -= task.cost

    if (queue.length === 0 && interval) {
      clearInterval(interval)
      interval = null
      isTerminating = true
    }

    const result = await task.task()
    completedTaskLog.push([new Date().getTime(), task.cost])

    if (isTerminating && !interval) {
      // log('Task queue terminated')
    }

    task.resolve(result)
    tasksInflight -= 1
  }

  // const refillTokens = () => {
  //   const now = Math.floor(Date.now() / 1000)

  //   const refill = (now - lastFilled) * fillPerSecond
  //   tokens = Math.min(capacity, tokens + refill)

  //   lastFilled = now
  // }

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
    // refillTokens()

    if (queue.length && canProcessNextTask()) {
      log(
        'Pending',
        tasksInflight,
        'Queue',
        queue.length,
        'Pool',
        poolSize,
        'Max Queue',
        maxQueueSize || '∞',
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
    params: TaskParams = {}
  ): Promise<T> {
    const { priority = 0, cost = 1 } = params

    assertRunning()
    return new Promise((resolve, reject) => {
      queue.push({
        task,
        resolve,
        reject,
        cost,
        priority,
      })

      while (maxQueueSize && queue.length > maxQueueSize) {
        log('Dropping lowest priorty task')
        popLastTask()
      }
    })
  }

  return {
    queue,
    add,
  }
}
