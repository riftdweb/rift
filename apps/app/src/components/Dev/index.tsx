import { useEffect, useState } from 'react'
import {
  Flex,
  Card,
  Container,
  Heading,
  Text,
  Subheading,
  Panel,
  Box,
} from '@riftdweb/design-system'
import { ITaskQueue, taskQueueRegistry } from '../../shared/taskQueue'

export function Dev() {
  const [taskQueues, setTaskQueues] = useState<ITaskQueue<any>[]>([])

  useEffect(() => {
    setInterval(() => {
      // @ts-ignore
      const _taskQueues = Object.entries(taskQueueRegistry).map(
        ([_name, taskQueue]) => taskQueue
      ) as ITaskQueue<any>[]
      setTaskQueues(_taskQueues)
    }, 1000)
  }, [])

  return (
    <Container size="4" css={{ py: '$3', flexDirection: 'column', gap: '$3' }}>
      <Flex
        css={{
          flexDirection: 'column',
          gap: '$3',
          width: '100%',
          height: '80vh',
        }}
      >
        <Heading>Task Queues</Heading>
        <Flex
          css={{
            gap: '$1',
            width: '100%',
            overflowX: 'auto',
            overflowY: 'hidden',
          }}
        >
          {taskQueues.map((taskQueue) => (
            <Flex
              css={{
                flex: 1,
                flexDirection: 'column',
                overflowY: 'auto',
                height: '100%',
                gap: '$1',
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
                      <Box
                        css={{
                          padding: '$1',
                          backgroundColor: '$purple500',
                          overflow: 'hidden',
                          borderRadius: '$1',
                        }}
                      >
                        <Flex css={{ justifyContent: 'space-between' }}>
                          <Text css={{ flex: 1, color: '$gray900' }}>
                            {task.name}
                          </Text>
                          <Text css={{ color: '$gray900' }}>
                            {task.priority}
                          </Text>
                        </Flex>
                      </Box>
                    ))}
                    {taskQueue.queue.map((task) => (
                      <Box
                        css={{
                          margin: '$1 0',
                          padding: '$1',
                          backgroundColor: '$gray200',
                          overflow: 'hidden',
                          borderRadius: '$1',
                        }}
                      >
                        <Flex css={{ justifyContent: 'space-between' }}>
                          <Text css={{ flex: 1, color: '$gray900' }}>
                            {task.name}
                          </Text>
                          <Text css={{ color: '$gray900' }}>
                            {task.priority}
                          </Text>
                        </Flex>
                      </Box>
                    ))}
                  </Flex>
                </Flex>
              </Panel>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Container>
  )
}
