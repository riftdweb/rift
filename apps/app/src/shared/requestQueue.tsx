import { createLogger } from './logger'

export function RequestQueue(namespace: string, taskPoolSize = 1) {
  const log = createLogger(`${namespace}/RequestQueue`)

  const queue = []
  // let tasksInflight = false
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

  const assertRunning = () => {
    if (interval) {
      return
    }

    log('Starting up')
    interval = setInterval(async () => {
      if (queue.length) {
        log('Queue size', queue.length, 'Pool size', taskPoolSize)
      }
      if (tasksInflight >= taskPoolSize) {
        log('Waiting on tasks')
      }
      while (queue.length && tasksInflight < taskPoolSize) {
        startNextTask()
      }
    }, 2000)
  }

  // Append task to the end of the queue
  async function append(task: () => Promise<any>) {
    assertRunning()
    return new Promise((resolve, reject) => {
      queue.push({
        task,
        resolve,
        reject,
      })
    })
  }

  // Prepend task to the beginning of the queue
  async function prepend(task: () => Promise<any>) {
    assertRunning()
    return new Promise((resolve, reject) => {
      queue.unshift({
        task,
        resolve,
        reject,
      })
    })
  }

  return {
    queue,
    append,
    prepend,
  }
}
