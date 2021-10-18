import { Box, Flex, Text, Tooltip } from '@riftdweb/design-system'
import { useSkynet, useUsers } from '@riftdweb/core'
import { Task } from '@riftdweb/queue'

type Props = {
  task: Task<any>
  color?: string
  dupeCount?: number
}

export function TaskItem({ task, color, dupeCount }: Props) {
  const { controlRef: ref } = useSkynet()
  const { isInitUsersComplete } = useUsers()

  if (!isInitUsersComplete) {
    return null
  }

  const user = ref.current.getUser(task.meta.id)

  const { shareCount } = task

  return (
    <Box
      css={{
        margin: '$1 0',
        padding: '$1',
        backgroundColor: color || '$gray200',
        overflow: 'hidden',
        borderRadius: '$1',
      }}
    >
      <Flex css={{ flexDirection: 'column', gap: '$1' }}>
        <Flex css={{ justifyContent: 'space-between', gap: '$1' }}>
          <Text css={{ color: '$gray900', flex: 1 }}>
            {task.id.slice(0, 5)}
          </Text>
          {dupeCount > 1 && (
            <Tooltip content="Task potential duplicate count">
              <Text
                css={{
                  color: '$red900',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {dupeCount}
              </Text>
            </Tooltip>
          )}
          {shareCount > 1 && (
            <Tooltip content="Task share count">
              <Text
                css={{
                  color: '$green900',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {shareCount}
              </Text>
            </Tooltip>
          )}
          <Tooltip content="Task priority">
            <Text
              css={{
                color: '$hiContrast',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {task.priority}
            </Text>
          </Tooltip>
        </Flex>
        <Flex css={{ justifyContent: 'space-between', gap: '$1' }}>
          <Text
            css={{
              flex: 1,
              color: '$hiContrast',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {task.meta.id?.slice(0, 5)} {user && user.username}
          </Text>
        </Flex>
        {task.meta.name && (
          <Text
            css={{
              flex: 1,
              color: '$hiContrast',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {task.meta.name}
          </Text>
        )}
        <Text css={{ color: '$hiContrast' }}>{task.meta.operation}</Text>
      </Flex>
    </Box>
  )
}
