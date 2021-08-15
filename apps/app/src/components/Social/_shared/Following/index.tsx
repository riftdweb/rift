import { Box, Button, Flex, Text } from '@riftdweb/design-system'
import { Fragment } from 'react'
import { useSkynet } from '../../../../contexts/skynet'
import { useUsers } from '../../../../contexts/users'
import { FollowingContextMenu } from './FollowingContextMenu'
import { StickySection } from '../StickySection'
import { StickyHeading } from '../StickyHeading'
import { Follow } from './Follow'
import { SuggestedFollow } from './SuggestedFollow'
import { EntriesState } from '../../../_shared/EntriesState'
import { ScrollArea } from '../../../_shared/ScrollArea'

export function Following() {
  const { myUserId, login } = useSkynet()
  const { friends, followings, suggestions } = useUsers()

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
          <Button onClick={() => login()}>Log in with MySky</Button>
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
                  title="Friends"
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
                    {friends.data?.entries.map(({ userId, profile }) => (
                      <Follow key={userId} userId={userId} />
                    ))}
                  </EntriesState>
                </Flex>
              </Fragment>
            )}
            <StickyHeading
              title="Following"
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
                response={followings}
                validatingMessage="Loading"
                emptyMessage="Not following anyone yet."
              >
                {followings.data?.entries.map(({ userId, profile }) => (
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
                    {suggestions.data?.entries.map(({ userId, profile }) => (
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
