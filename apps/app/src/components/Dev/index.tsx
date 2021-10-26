import { Flex, Container } from '@riftdweb/design-system'
import { useParams } from 'react-router-dom'
import { Link } from '@riftdweb/core'
import { DevTaskManager } from './TaskManager'
import { DevIndexingManager } from './IndexingManager'

type ToolName = 'task-manager' | 'indexing-manager'

export function Dev() {
  const { toolName } = useParams() as { toolName: ToolName }

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
          <Link
            to={'/dev/task-manager'}
            css={{
              color: toolName === 'task-manager' ? '$hiContrast' : '$gray8',
              cursor: 'pointer',
              '&:hover': {
                color: toolName === 'task-manager' ? '$hiContrast' : '$gray11',
              },
            }}
          >
            Task Manager
          </Link>
          <Link
            to={'/dev/indexing-manager'}
            css={{
              color: toolName === 'indexing-manager' ? '$hiContrast' : '$gray8',
              cursor: 'pointer',
              '&:hover': {
                color:
                  toolName === 'indexing-manager' ? '$hiContrast' : '$gray11',
              },
            }}
          >
            Indexing Manager
          </Link>
        </Flex>
        {toolName === 'task-manager' && <DevTaskManager />}
        {toolName === 'indexing-manager' && <DevIndexingManager />}
      </Flex>
    </Container>
  )
}
