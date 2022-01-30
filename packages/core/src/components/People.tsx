import React from 'react'
import { useObservableState } from 'observable-hooks'
import { Flex, Box } from '@riftdweb/design-system'
import { Avatar } from './Avatar'
import { getUsers$ } from '../services/users/api'

type Props = {
  userIds: string[]
}

export function People({ userIds }: Props) {
  const userItems = useObservableState(getUsers$(userIds))

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
