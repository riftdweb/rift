import { Flex, Text } from '@riftdweb/design-system'
import { useEffect } from 'react'
import { useUsers } from '../../contexts/users'
import { UserProfile } from '../_shared/UserProfile'

export function UserLookup({ searchValue }) {
  const { addNewUserIds, isInitUsersComplete } = useUsers()

  useEffect(() => {
    if (isInitUsersComplete) {
      addNewUserIds([searchValue])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Flex css={{ flexDirection: 'column', gap: '$2', padding: '$1 $3 $2 $3' }}>
      <Text
        css={{
          color: '$gray900',
          fontWeight: '600',
          flex: 1,
        }}
      >
        User
      </Text>
      <UserProfile userId={searchValue} />
    </Flex>
  )
}
