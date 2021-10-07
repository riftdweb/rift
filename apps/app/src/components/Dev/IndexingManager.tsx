import { Box, Flex, Panel, Subheading, Text } from '@riftdweb/design-system'
import { useEffect, useState } from 'react'
import {
  useSkynet,
  useUsers,
  checkIsUserUpToDate,
  EntriesResponse,
} from '@riftdweb/core'

export function DevIndexingManager() {
  const { controlRef: ref } = useSkynet()
  const [key, setKey] = useState<number>(Math.random())
  const {
    usersMap,
    pendingUserIds,
    friends,
    following,
    suggestions,
  } = useUsers()

  useEffect(() => {
    const interval = setInterval(() => {
      setKey(Math.random())
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [])

  if (!usersMap.data) {
    return null
  }

  const pendingUserIdsWithPos = pendingUserIds.map((userId, i) => ({
    userId,
    position: i,
  }))

  const groups: { name: string; users: EntriesResponse<string> }[] = [
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
      key={key}
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
              backgroundColor: '$gray200',
              padding: '$2',
            }}
          >
            <Flex css={{ flexDirection: 'column', gap: '$3' }}>
              <Flex css={{ justifyContent: 'space-between' }}>
                <Subheading
                  css={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Pending sync
                </Subheading>
              </Flex>
              <Flex css={{ flexDirection: 'column', gap: '$2' }}>
                {pendingUserIdsWithPos.map(({ userId, position }) => {
                  const user = ref.current.getUser(userId)
                  if (!user) {
                    return (
                      <Box
                        css={{
                          backgroundColor: '$yellow900',
                          borderRadius: '$1',
                          padding: '$1',
                        }}
                      >
                        <Text>{userId.slice(0, 5)}</Text>
                        <Text>New</Text>
                      </Box>
                    )
                  }
                  const { isUpToDate, checks } = checkIsUserUpToDate(
                    ref,
                    user,
                    {
                      level: 'index',
                    }
                  )
                  return (
                    <Box
                      css={{
                        backgroundColor: isUpToDate ? 'none' : '$red900',
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
                  backgroundColor: '$gray200',
                }}
              >
                <Flex css={{ flexDirection: 'column', gap: '$3' }}>
                  <Flex css={{ justifyContent: 'space-between' }}>
                    <Subheading
                      css={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {name}
                    </Subheading>
                  </Flex>
                  <Flex css={{ flexDirection: 'column', gap: '$2' }}>
                    {users.data?.entries
                      .map((userId) => ({
                        userId,
                        position: pendingUserIds.findIndex(
                          (pendingId) => pendingId === userId
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
                      .map(({ userId, position }) => {
                        const user = ref.current.getUser(userId)
                        if (!user) {
                          return null
                        }

                        const { isUpToDate, checks } = checkIsUserUpToDate(
                          ref,
                          user,
                          {
                            level: 'index',
                          }
                        )
                        return (
                          <Box
                            key={userId}
                            css={{
                              backgroundColor: isUpToDate
                                ? '$gray400'
                                : '$red900',
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
