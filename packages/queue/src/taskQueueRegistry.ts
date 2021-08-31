import { createLogger } from '@riftdweb/logger'
import { ITaskQueue } from './types'

const log = createLogger('taskQueueRegistry')

export const taskQueueRegistry: Record<string, ITaskQueue<any>> = {}

export function clearAllTaskQueues() {
  Object.entries(taskQueueRegistry).forEach(([name, taskQueue]) => {
    log(
      `${name}: clearing ${taskQueue.queue.length} tasks, rejecting ${taskQueue.pendingQueue.length} pending tasks`
    )
    taskQueue.queue = []
    taskQueue.pendingQueue.forEach((task) => task.reject!())
  })
}
