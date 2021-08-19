import {
  Box,
  Flex,
  Heading,
  Panel,
  Subheading,
  Text,
} from '@riftdweb/design-system'
import { Feed, IUser } from '@riftdweb/types'
import { useEffect, useState } from 'react'
import { SWRResponse } from 'swr'
import { useSkynet } from '../../contexts/skynet'
import { useUsers } from '../../contexts/users'
import { checkIsUserUpToDate } from '../../contexts/users/utils'

type Props = {}

export function DevUserIndexing({}: Props) {
  const { controlRef: ref } = useSkynet()
  const [key, setKey] = useState<number>(Math.random())
  const {
    usersMap,
    pendingUserIds,
    friends,
    followings,
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

  const groups: { name: string; users: SWRResponse<Feed<IUser>, any> }[] = [
    {
      name: 'Friends',
      users: friends,
    },
    {
      name: 'Following',
      users: followings,
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
                        <Text>{userId}</Text>
                        <Text>New</Text>
                      </Box>
                    )
                  }
                  const { isUpToDate, checks } = checkIsUserUpToDate(user, {
                    include: ['profile', 'following', 'feed'],
                  })
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
                    {users.data?.entries.map(({ userId }) => {
                      const user = ref.current.getUser(userId)
                      const { isUpToDate, checks } = checkIsUserUpToDate(user, {
                        include: ['profile', 'following', 'feed'],
                      })
                      const queuePosition = pendingUserIds.findIndex(
                        (pendingId) => pendingId === user.userId
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
                          <Text>
                            {!!~queuePosition
                              ? `Queued at: ${queuePosition}`
                              : 'Not in queue'}
                          </Text>
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
          )
        })}
      </Flex>
    </Flex>
  )
}
