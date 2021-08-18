import { createLogger } from './logger'
import { v4 as uuid } from 'uuid'

type Params = {
  poolSize?: number
  maxQueueSize?: number
  processingInterval?: number
}

type TaskParams = {
  name: string
  cost?: number
  priority?: number
  key?: string
  meta?: {}
}

type Task<T> = {
  id: string
  name: string
  task: () => Promise<T>
  cost: number
  priority: number
  key?: string
  // Optional because tasks get pushed before these attributes are available
  resolve?: (value: T | PromiseLike<T>) => void
  reject?: () => void
  promise?: Promise<T>
}

const defaultParams = {
  poolSize: 1,
  processingInterval: 2_000,
}

export const taskQueueRegistry = {}

export type ITaskQueue<T> = {
  name: string
  add: <T>(task: () => Promise<T>, params: TaskParams) => Promise<T>
  queue: Task<T>[]
  pendingQueue: Task<T>[]
}

export function TaskQueue<T>(name: string, params: Params = {}): ITaskQueue<T> {
  const { poolSize, maxQueueSize, processingInterval } = {
    ...defaultParams,
    ...params,
  }

  const log = createLogger(`${name}/TaskQueue`)

  // queue
  const queue: Task<any>[] = []
  const pendingQueue: Task<any>[] = []

  // // rate limiting
  // let tokens = ratePerMinute
  // let lastFilled = Math.floor(Date.now() / 1000)
  // let fillPerSecond = ratePerMinute / 60

  // metrics
  let completedTaskLog: [number, number][] = []

  let interval = null

  const getNextTaskIndexByKey = (key: string): number => {
    if (queue.length === 0) {
      return -1
    }
    const { index } = queue.reduce(
      (acc, task, i) => {
        if (key === task.key) {
          if (task.priority > acc.priority) {
            return {
              index: i,
              priority: task.priority,
            }
          }
          return acc
        }
        return acc
      },
      {
        index: -1,
        priority: 0,
      }
    )
    return index
  }

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
      (acc, task, i) => {
        const { priority } = acc
        // <= so that later in queue is selected when equal
        if (task.priority <= priority) {
          return {
            index: i,
            priority: task.priority,
          }
        }
        return acc
      },
      {
        index: queue.length - 1,
        priority: 0,
      }
    )
    return index
  }

  const peekNextTaskByKey = (key: string): Task<any> | undefined => {
    const index = getNextTaskIndexByKey(key)
    if (!~index) {
      return undefined
    }
    return queue[index]
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
    return pendingQueue.length < poolSize
  }

  const processNextTask = async () => {
    let isTerminating = false

    const task = popNextTask()
    const id = task.id

    pendingQueue.push(task)
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
    const index = pendingQueue.findIndex((task) => task.id === id)
    pendingQueue.splice(index, 1)
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
        pendingQueue.length,
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
    params: TaskParams
  ): Promise<T> {
    const { priority = 0, cost = 1, key } = params
    assertRunning()

    if (key) {
      const equivalentTask = peekNextTaskByKey(key)
      if (equivalentTask) {
        log('Returning equivalent task')
        return equivalentTask.promise
      }
    }

    const queueTask: Task<any> = {
      id: uuid(),
      name: params.name,
      task,
      cost,
      priority,
      key,
    }

    queue.push(queueTask)
    const promise = new Promise((resolve, reject) => {
      queueTask.resolve = resolve
      queueTask.reject = reject
      while (maxQueueSize && queue.length > maxQueueSize) {
        log('Dropping lowest priorty task')
        popLastTask()
      }
    })
    queueTask.promise = promise
    return promise as Promise<T>
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
