import { Box, Flex, Text } from '@riftdweb/design-system'
import { useSkynet } from '../../contexts/skynet'
import { useUsers } from '../../contexts/users'
import { Task } from '../../shared/taskQueue'

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
          {dupeCount > 1 && <Text css={{ color: '$red900' }}>{dupeCount}</Text>}
          {shareCount > 1 && (
            <Text css={{ color: '$green900' }}>{shareCount}</Text>
          )}
          <Text css={{ color: '$hiContrast' }}>{task.priority}</Text>
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
