import {
  Flex,
  Container,
  Box,
  Subheading,
  Heading,
} from '@riftdweb/design-system'
import { useState } from 'react'
import { DevTaskManager } from './TaskManager'
import { DevUserIndexing } from './UserIndexing'

type Tab = 'taskManager' | 'userIndexing'
export function Dev() {
  const [tab, setTab] = useState<Tab>('taskManager')

  return (
    <Container size="4">
      <Flex
        css={{
          py: '$3',
          flexDirection: 'column',
          gap: '$3',
        }}
      >
        <Flex css={{ gap: '$3' }}>
          <Heading
            css={{
              color: tab === 'taskManager' ? '$hiContrast' : '$gray700',
              cursor: 'pointer',
              '&:hover': {
                color: '$hiContrast',
              },
            }}
            onClick={() => setTab('taskManager')}
          >
            Task Manager
          </Heading>
          <Heading
            css={{
              color: tab === 'userIndexing' ? '$hiContrast' : '$gray700',
              cursor: 'pointer',
              '&:hover': {
                color: '$hiContrast',
              },
            }}
            onClick={() => setTab('userIndexing')}
          >
            User Indexing
          </Heading>
        </Flex>
        {tab === 'taskManager' && <DevTaskManager />}
        {tab === 'userIndexing' && <DevUserIndexing />}
      </Flex>
    </Container>
  )
}
