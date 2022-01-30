import { Box, Flex, Panel, Heading, Text } from '@riftdweb/design-system'
import { checkIsUserUpToDate } from '@riftdweb/core'
import { useObservableState } from 'observable-hooks'
import {
  getFollowing,
  getFriends,
  getPending$,
  getSuggestions$,
  getUsers$,
} from '@riftdweb/core/src/services/users/api'
import { useAccount } from '@riftdweb/core/src/hooks/useAccount'
import { IUserDoc } from '@riftdweb/core/src/stores/user'
import { IUser } from '@riftdweb/types'

export function DevIndexingManager() {
  const account = useAccount()
  const users = useObservableState(getUsers$())
  const friends = useObservableState(getFriends().$)
  const following = useObservableState(getFollowing().$)
  const suggestions = useObservableState(getSuggestions$())
  const pending = useObservableState(getPending$())

  if (!users || !users.length) {
    return null
  }

  const pendingUsersWithPos = pending.map((user, i) => ({
    user,
    position: i,
  }))

  const groups: { name: string; users: (IUserDoc | IUser)[] }[] = [
    {
      name: 'Friends',
      users: friends,
    },
    {
      name: 'Following',
      users: following,
    },
    {
      name: 'Suggestions',
      users: suggestions,
    },
  ]

  return (
    <Flex
      css={{
        flexDirection: 'column',
        gap: '$3',
      }}
    >
      <Flex
        css={{
          gap: '$1',
          width: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        <Flex
          css={{
            flex: 1,
            flexDirection: 'column',
            overflowY: 'auto',
            height: '100%',
            gap: '$1',
          }}
        >
          <Panel
            css={{
              backgroundColor: '$gray3',
              padding: '$2',
            }}
          >
            <Flex css={{ flexDirection: 'column', gap: '$3' }}>
              <Flex css={{ justifyContent: 'space-between' }}>
                <Heading
                  size="1"
                  css={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Pending sync
                </Heading>
              </Flex>
              <Flex css={{ flexDirection: 'column', gap: '$2' }}>
                {pendingUsersWithPos.map(({ user, position }) => {
                  if (!user) {
                    return (
                      <Box
                        css={{
                          backgroundColor: '$yellow10',
                          borderRadius: '$1',
                          padding: '$1',
                        }}
                      >
                        <Text>{user.userId.slice(0, 5)}</Text>
                        <Text>New</Text>
                      </Box>
                    )
                  }
                  const { isUpToDate, checks } = checkIsUserUpToDate(
                    account,
                    user,
                    {
                      level: 'index',
                    }
                  )
                  return (
                    <Box
                      css={{
                        backgroundColor: isUpToDate ? 'none' : '$red10',
                        borderRadius: '$1',
                        padding: '$1',
                      }}
                    >
                      <Text>{user.username || user.userId}</Text>
                      <Text>{isUpToDate ? 'Up to date' : 'Expired'}</Text>
                      <Text>Queued at: {position}</Text>
                      {checks.map((check) => (
                        <Box>
                          <Text>{check.message}</Text>
                        </Box>
                      ))}
                    </Box>
                  )
                })}
              </Flex>
            </Flex>
          </Panel>
        </Flex>
        {groups.map(({ name, users }) => {
          return (
            <Flex
              css={{
                flex: 1,
                flexDirection: 'column',
                overflowY: 'auto',
                height: '100%',
                gap: '$1',
                display: 'none',
                '@bp3': {
                  display: 'block',
                },
              }}
            >
              <Panel
                css={{
                  padding: '$2',
                  backgroundColor: '$gray3',
                }}
              >
                <Flex css={{ flexDirection: 'column', gap: '$3' }}>
                  <Flex css={{ justifyContent: 'space-between' }}>
                    <Heading
                      size="1"
                      css={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {name}
                    </Heading>
                  </Flex>
                  <Flex css={{ flexDirection: 'column', gap: '$2' }}>
                    {users
                      .map((user) => ({
                        user,
                        position: pending.findIndex(
                          (pendingId) => pendingId === user
                        ),
                      }))
                      .sort((a, b) =>
                        a.position === -1
                          ? 1
                          : b.position === -1
                          ? -1
                          : a.position > b.position
                          ? 1
                          : -1
                      )
                      .map(({ user, position }) => {
                        if (!user) {
                          return null
                        }

                        const { isUpToDate, checks } = checkIsUserUpToDate(
                          account,
                          user,
                          {
                            level: 'index',
                          }
                        )
                        return (
                          <Box
                            key={user.userId}
                            css={{
                              backgroundColor: isUpToDate ? '$gray5' : '$red10',
                              borderRadius: '$1',
                              padding: '$1',
                            }}
                          >
                            <Text>{user.username || user.userId}</Text>
                            <Text>{isUpToDate ? 'Up to date' : 'Expired'}</Text>
                            <Text>
                              {!!~position
                                ? `Queued at: ${position}`
                                : 'Not in queue'}
                            </Text>
                            {checks.map((check) => (
                              <Box key={check.message}>
                                <Text>{check.message}</Text>
                              </Box>
                            ))}
                          </Box>
                        )
                      })}
                  </Flex>
                </Flex>
              </Panel>
            </Flex>
          )
        })}
      </Flex>
    </Flex>
  )
}
