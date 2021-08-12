import { createLogger } from './logger'

type Params = {
  poolSize?: number
  maxQueueSize?: number
  processingInterval?: number
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

  const queue = []
  let tasksInflight = 0

  let interval = null

  const startNextTask = async () => {
    tasksInflight += 1
    const task = queue.shift()
    if (queue.length === 0) {
      log('Shutting down')
      clearInterval(interval)
      interval = null
    }
    log('Starting task')
    const result = await task.task()
    log('Task complete')
    task.resolve(result)
    tasksInflight -= 1
  }

  const processQueue = async () => {
    if (queue.length) {
      log(
        'Pending',
        tasksInflight,
        'Queue',
        queue.length,
        'Max Queue',
        maxQueueSize || '∞',
        'Pool',
        poolSize
      )
    }
    if (tasksInflight >= poolSize) {
      log('Waiting on tasks')
    }
    while (queue.length && tasksInflight < poolSize) {
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
