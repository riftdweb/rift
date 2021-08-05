import {
  Badge,
  Box,
  Flex,
  Panel,
  Text,
  Subtitle,
} from '@riftdweb/design-system'
import { intersection } from 'lodash'
import { useMemo } from 'react'
import { useSkynet } from '../../contexts/skynet'
import { useUsers } from '../../contexts/users'
import { People } from '../_shared/People'
import { User } from '../_shared/User'
import { UserProfile } from '../_shared/UserProfile'

export function UserResults({ searchValue }) {
  const { myUserId, controlRef: ref } = useSkynet()
  const { followingUserIds } = useUsers()
  const allItems = Object.entries(ref.current.allUsers).map(
    ([id, entry]) => entry
  )

  const filteredItems = useMemo(() => {
    const lowerCaseSearchValue = searchValue.toLowerCase()

    return allItems.filter((userItem) => {
      if (userItem.username?.toLowerCase().includes(lowerCaseSearchValue)) {
        return true
      }
      if (
        userItem.profile?.firstName
          ?.toLowerCase()
          .includes(lowerCaseSearchValue)
      ) {
        return true
      }
      if (
        userItem.profile?.lastName?.toLowerCase().includes(lowerCaseSearchValue)
      ) {
        return true
      }
      if (
        userItem.profile?.aboutMe?.toLowerCase().includes(lowerCaseSearchValue)
      ) {
        return true
      }
      if (
        userItem.profile?.location?.toLowerCase().includes(lowerCaseSearchValue)
      ) {
        return true
      }
      return false
    })
  }, [searchValue])
  const pagedItems = filteredItems.slice(0, 20)

  return (
    <Flex css={{ flexDirection: 'column', gap: '$2' }}>
      <Flex css={{ gap: '$1' }}>
        <Text
          css={{
            color: '$gray900',
            fontWeight: '600',
            flex: 1,
          }}
        >
          Social
        </Text>
        <Box css={{ flex: 1 }} />
        <Text
          css={{
            color: '$gray800',
          }}
        >
          {filteredItems.length === 1
            ? '1 result'
            : `${filteredItems.length} results`}
        </Text>
      </Flex>
      {filteredItems.length ? (
        <Flex
          css={{
            flexDirection: 'column',
            // gap: '$5',
          }}
        >
          {pagedItems.map((userItem) => {
            return (
              <Box
                css={{
                  padding: '$2 0',
                  borderBottom: '1px solid $gray300',
                  '&:last-of-type': {
                    borderBottom: 'none',
                  },
                }}
              >
                <UserProfile
                  userId={userItem.userId}
                  version="compact"
                  userItem={userItem}
                />
              </Box>
            )
          })}
        </Flex>
      ) : (
        <Text css={{ color: '$gray900' }}>
          No results. Try searching by the user's username, first name, last
          name, about info, or location.
        </Text>
      )}
    </Flex>
  )
}
