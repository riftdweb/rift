import { useEffect, useState } from 'react'
import { Flex, Subheading, Panel } from '@riftdweb/design-system'
import { ITaskQueue, taskQueueRegistry } from '../../shared/taskQueue'
import { Task } from '../../shared/taskQueue'
import { TaskItem } from './TaskItem'

export function DevTaskManager() {
  const [taskQueues, setTaskQueues] = useState<ITaskQueue<any>[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      // @ts-ignore
      const _taskQueues = Object.entries(taskQueueRegistry).map(
        ([_name, taskQueue]) => taskQueue
      ) as ITaskQueue<any>[]
      setTaskQueues(_taskQueues)
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <Flex
      css={{
        flexDirection: 'column',
        gap: '$3',
      }}
    >
      <Flex
        css={{
          gap: '$1',
          width: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        {taskQueues.map((taskQueue) => {
          if (
            taskQueue.pendingQueue.length === 0 &&
            taskQueue.queue.length === 0
          ) {
            return null
          }

          const dupeKeyCountMap = getDupeKeyCountMap([
            ...taskQueue.pendingQueue,
            ...taskQueue.queue,
          ])

          return (
            <Flex
              css={{
                flexDirection: 'column',
                overflowY: 'auto',
                height: '100%',
                gap: '$1',
                display: taskQueue.name === 'api/registry' ? 'block' : 'none',
                flex: taskQueue.name === 'api/registry' ? 2 : 1,
                '@bp3': {
                  display: 'block',
                },
              }}
            >
              <Panel
                css={{
                  padding: '$2',
                }}
              >
                <Flex css={{ flexDirection: 'column', gap: '$3' }}>
                  <Flex css={{ justifyContent: 'space-between' }}>
                    <Subheading
                      css={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {taskQueue.name}
                    </Subheading>
                    <Subheading>
                      ({taskQueue.pendingQueue.length} |{' '}
                      {taskQueue.queue.length})
                    </Subheading>
                  </Flex>
                  <Flex css={{ flexDirection: 'column', gap: '$2' }}>
                    {taskQueue.pendingQueue.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        color="$purple700"
                        dupeCount={dupeKeyCountMap[task.key]}
                      />
                    ))}
                    {taskQueue.queue.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        dupeCount={dupeKeyCountMap[task.key]}
                      />
                    ))}
                  </Flex>
                </Flex>
              </Panel>
            </Flex>
          )
        })}
      </Flex>
    </Flex>
  )
}

function getDupeKeyCountMap(queue: Task<any>[]) {
  return queue.reduce((acc, { key }) => {
    if (!key) {
      return acc
    }

    const count = acc[key] || 0

    return {
      ...acc,
      [key]: count + 1,
    }
  }, {})
}
