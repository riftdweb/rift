import {
  Flex,
  Box,
  AvatarGroup,
  AvatarNestedItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
  Tooltip,
} from '@riftdweb/design-system'
import { useSkynet } from '../../contexts/skynet'
import { Avatar } from './Avatar'

type Props = {
  userIds: string[]
}

export function People({ userIds }: Props) {
  const { controlRef } = useSkynet()

  const userItems = userIds.map((userId) => {
    const userItem = controlRef.current.allUsers[userId]
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
          <Avatar userId={userId} profile={profile} size="1" link />
        </Box>
      ))}
    </Flex>
  )
}
