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
  const { usersMap } = useUsers()

  if (!usersMap.data) {
    return null
  }

  const user = ref.current.getUser(task.meta.id)
  const targetUser = ref.current.getUser(task.meta.name)

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
      <Flex css={{ flexDirection: 'column' }}>
        <Flex css={{ justifyContent: 'space-between' }}>
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
          {dupeCount && <Text css={{ color: '$red900' }}>{dupeCount}</Text>}
          <Text css={{ color: '$hiContrast' }}>{task.priority}</Text>
        </Flex>
        <Text
          css={{
            flex: 1,
            color: '$hiContrast',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {targetUser
            ? `${task.meta.name.slice(0, 5)} ${targetUser?.username}`
            : task.meta.name}
        </Text>
        <Text css={{ color: '$hiContrast' }}>{task.meta.operation}</Text>
      </Flex>
    </Box>
  )
}
