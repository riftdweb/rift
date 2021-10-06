import { Box, Button, Flex, Text } from '@riftdweb/design-system'
import { Fragment } from 'react'
import { useSkynet } from '@riftdweb/core'
import { useUsers } from '@riftdweb/core'
import { FollowingContextMenu } from './FollowingContextMenu'
import { StickySection } from '../StickySection'
import { StickyHeading } from '../StickyHeading'
import { Follow } from './Follow'
import { SuggestedFollow } from './SuggestedFollow'
import { EntriesState } from '@riftdweb/core'
import { ScrollArea } from '@riftdweb/core'

export function Following() {
  const { myUserId, login } = useSkynet()
  const { friends, following, suggestions } = useUsers()

  if (!myUserId) {
    return (
      <StickySection width="100%">
        <StickyHeading title="Following" />
        <Flex
          css={{
            flexDirection: 'column',
            gap: '$2',
            alignItems: 'center',
            textAlign: 'center',
            margin: '$2 0',
          }}
        >
          <Text
            size="2"
            css={{
              color: '$gray900',
              lineHeight: '16px',
              flex: 1,
            }}
          >
            Log in to follow other users and build a personalized feed.
          </Text>
          <Button onClick={() => login()}>Log in with Skynet</Button>
        </Flex>
      </StickySection>
    )
  }

  return (
    <StickySection width="100%" css={{ pt: '$3' }}>
      <Box
        css={{
          paddingRight: '$3',
          width: '100%',
        }}
      >
        <Follow key={myUserId} userId={myUserId} />
      </Box>
      <Box
        css={{
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <ScrollArea>
          <Flex
            css={{
              flexDirection: 'column',
              flex: 1,
              gap: '$2',
            }}
          >
            {!!friends.data?.entries.length && (
              <Fragment>
                <StickyHeading
                  title={
                    friends.data
                      ? `Friends (${friends.data?.entries.length})`
                      : 'Friends'
                  }
                  css={{
                    marginRight: '$3',
                  }}
                />
                <Flex
                  css={{
                    flexDirection: 'column',
                    width: '100%',
                    gap: '$2',
                    // paddingBottom: '$2',
                    padding: '0 $3 $2 0',
                    flexShrink: 1,
                  }}
                >
                  <EntriesState
                    response={friends}
                    validatingMessage="Loading"
                    emptyMessage="No friends."
                  >
                    {friends.data?.entries.map((userId) => (
                      <Follow key={userId} userId={userId} />
                    ))}
                  </EntriesState>
                </Flex>
              </Fragment>
            )}
            <StickyHeading
              title={
                following.data
                  ? `Following (${following.data?.entries.length})`
                  : 'Following'
              }
              contextMenu={<FollowingContextMenu />}
              css={{
                marginRight: '$3',
              }}
            />
            <Flex
              css={{
                flexDirection: 'column',
                width: '100%',
                gap: '$2',
                // paddingBottom: '$2',
                padding: '0 $3 $2 0',
                flexShrink: 1,
              }}
            >
              <EntriesState
                response={following}
                validatingMessage="Loading your user lists"
                emptyMessage="Not following anyone yet."
              >
                {following.data?.entries.map((userId) => (
                  <Follow key={userId} userId={userId} />
                ))}
              </EntriesState>
            </Flex>
            {!!suggestions.data?.entries.length && (
              <Fragment>
                <StickyHeading
                  title="Suggestions"
                  css={{
                    marginRight: '$3',
                  }}
                />
                <Flex
                  css={{
                    flexDirection: 'column',
                    width: '100%',
                    gap: '$2',
                    // paddingBottom: '$2',
                    padding: '0 $3 $2 0',
                    flexShrink: 1,
                  }}
                >
                  <EntriesState
                    response={suggestions}
                    validatingMessage="Loading"
                    emptyMessage="No suggestions."
                  >
                    {suggestions.data?.entries.map((userId) => (
                      <SuggestedFollow key={userId} userId={userId} />
                    ))}
                  </EntriesState>
                </Flex>
              </Fragment>
            )}
          </Flex>
        </ScrollArea>
      </Box>
    </StickySection>
  )
}
