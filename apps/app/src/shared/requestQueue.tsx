import { createLogger } from './logger'

export function RequestQueue(namespace: string) {
  const log = createLogger(`${namespace}/RequestQueue`)

  const queue = []
  let inflight = false

  let interval = null

  const assertRunning = () => {
    if (interval) {
      return
    }

    log('Starting up')
    interval = setInterval(async () => {
      if (queue.length) {
        log('Queue size', queue.length)
      }
      if (inflight) {
        log('Waiting on task')
      }
      if (queue.length && !inflight) {
        inflight = true
        const first = queue.pop()
        if (queue.length === 0) {
          log('Shutting down')
          clearInterval(interval)
          interval = null
        }
        log('Starting task')
        const result = await first.task()
        log('Task complete')
        first.resolve(result)
        inflight = false
      }
    }, 2000)
  }

  async function add(task: () => Promise<any>) {
    assertRunning()
    return new Promise((resolve, reject) => {
      queue.push({
        task,
        resolve,
        reject,
      })
    })
  }

  return {
    queue,
    add,
  }
}
