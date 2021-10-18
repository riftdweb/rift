import { createLogger } from '@riftdweb/logger'
import { v4 as uuid } from 'uuid'
import { taskQueueRegistry } from './taskQueueRegistry'
import { Complete, ITaskQueue, Params, Task, TaskParams } from './types'

const defaultParams: Params = {
  poolSize: 1,
  processingInterval: 2_000,
  mode: 'normal',
  dropStrategy: 'latest',
  maxQueueSize: undefined,
  disableLogger: false,
}

export function TaskQueue<T>(
  name: string,
  params: Partial<Params> = {}
): ITaskQueue<T> {
  const {
    poolSize,
    maxQueueSize,
    dropStrategy,
    processingInterval,
    mode,
    disableLogger,
  }: Params = {
    ...defaultParams,
    ...params,
  }

  const log = createLogger(`${name}/TaskQueue`, {
    disable: disableLogger,
  })

  // queue
  const queue: Task<any>[] = []
  const pendingQueue: Task<any>[] = []

  // // rate limiting
  // let tokens = ratePerMinute
  // let lastFilled = Math.floor(Date.now() / 1000)
  // let fillPerSecond = ratePerMinute / 60

  // metrics
  let completedTaskLog: [number, number][] = []

  let interval: ReturnType<typeof setInterval> | null = null

  const getPendingTaskIndexByKey = (key: string): number => {
    if (pendingQueue.length === 0) {
      return -1
    }
    const { index } = pendingQueue.reduce(
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
        // latest - more recently added to the queue is selected when equal
        if (dropStrategy === 'latest') {
          if (task.priority <= priority) {
            return {
              index: i,
              priority: task.priority,
            }
          }
          return acc
        }
        // earliest - oldest in the queue (lower index) is selected
        if (task.priority < priority) {
          return {
            index: i,
            priority: task.priority,
          }
        }
        return acc
      },
      {
        index: queue.length - 1,
        priority: 999,
      }
    )
    return index
  }

  const peekNextTaskByKey = (key: string): Task<any> | undefined => {
    let index = getPendingTaskIndexByKey(key)
    if (~index) {
      return pendingQueue[index]
    }
    index = getNextTaskIndexByKey(key)
    if (~index) {
      return queue[index]
    }
    return undefined
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
    return pendingQueue.length < poolSize
  }

  const processNextTask = async () => {
    let isTerminating = false

    const task = popNextTask()

    if (!task) {
      return
    }

    const id = task.id

    pendingQueue.push(task)
    // tokens -= task.cost

    if (queue.length === 0 && interval) {
      clearInterval(interval)
      interval = null
      isTerminating = true
    }

    try {
      const result = await task.task()
      task.resolve!(result)
    } catch (e) {
      console.log(`'${name}' taskQueue caught error`, e)
      task.reject!()
    }

    completedTaskLog.push([new Date().getTime(), task.cost])

    if (isTerminating && !interval) {
      // log('Task queue terminated')
    }

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

  const defaultTaskParams = {
    priority: 0,
    cost: 1,
  }

  async function add<T>(
    task: () => Promise<T>,
    params: TaskParams
  ): Promise<T> {
    const { meta, priority, cost }: Complete<TaskParams> = {
      ...defaultTaskParams,
      ...params,
    }

    assertRunning()

    const key = getTaskKey(meta)

    if (mode === 'dedupe') {
      const equivalentTask = peekNextTaskByKey(key)
      if (equivalentTask) {
        equivalentTask.shareCount += 1
        if (priority > equivalentTask.priority) {
          equivalentTask.priority = priority
          log(
            `Sharing equivalent task and raising priority. priority: ${equivalentTask.priority}, shareCount: ${equivalentTask.shareCount}`
          )
        } else {
          log(
            `Sharing equivalent task. priority: ${equivalentTask.priority}, shareCount: ${equivalentTask.shareCount}`
          )
        }
        return equivalentTask.promise
      }
    }

    const queueTask: Task<any> = {
      id: uuid(),
      meta,
      task,
      cost,
      priority,
      key,
      shareCount: 1,
    }

    queue.push(queueTask)
    const promise = new Promise((resolve, reject) => {
      queueTask.resolve = resolve
      queueTask.reject = reject
    })
    queueTask.promise = promise

    if (maxQueueSize) {
      while (queue.length > maxQueueSize) {
        log('Dropping lowest priorty task')
        popLastTask()
      }
    }

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

export function getTaskKey(meta: Task<any>['meta']) {
  return `${meta.id}/${meta.name}/${meta.operation}`
}
