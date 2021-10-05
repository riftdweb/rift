import { Flex, Box } from '@riftdweb/design-system'
import { useUsers } from '../contexts/users'
import { Avatar } from './Avatar'

type Props = {
  userIds: string[]
}

export function People({ userIds }: Props) {
  const { usersMap } = useUsers()

  const userItems = userIds.map((userId) => {
    const userItem = usersMap.data?.entries[userId]
    return userItem
  })

  return (
    <Flex
      css={{
        '& div': {
          marginRight: '-1px',
        },
      }}
    >
      {userItems.map(({ userId, profile }, i) => (
        <Box
          key={userId}
          css={{
            zIndex: userItems.length - 1 - i,
            transition: 'transform 0.1s',
            '&:hover': {
              cursor: 'pointer',
              transform: 'scale(1.4)',
              zIndex: userItems.length,
            },
          }}
        >
          <Avatar userId={userId} profile={profile.data} size="1" link />
        </Box>
      ))}
    </Flex>
  )
}
