import { Box, Button, Flex, Text } from '@riftdweb/design-system'
import { Fragment } from 'react'
import { useSkynet } from '../../../../hooks/skynet'
import { useUsers } from '../../../../hooks/users'
import { FollowingContextMenu } from './FollowingContextMenu'
import { StickySection } from '../StickySection'
import { StickyHeading } from '../StickyHeading'
import { Follow } from './Follow'
import { SuggestedFollow } from './SuggestedFollow'
import { EntriesState } from '../../../_shared/EntriesState'
import { ScrollArea } from '../../../_shared/ScrollArea'

export function Following() {
  const { myUserId, login } = useSkynet()
  const { followings, suggestions, suggestionUserIds } = useUsers()

  if (!myUserId) {
    return (
      <StickySection>
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
    <StickySection css={{ pt: '$3' }}>
      <Follow key={myUserId} userId={myUserId} />
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
            <StickyHeading
              title="Following"
              contextMenu={<FollowingContextMenu />}
            />
            <Flex
              css={{
                flexDirection: 'column',
                width: '100%',
                gap: '$2',
                paddingBottom: '$2',
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
            {!!suggestionUserIds.data?.length && (
              <Fragment>
                <StickyHeading title="Suggestions" />
                <Flex
                  css={{
                    flexDirection: 'column',
                    width: '100%',
                    gap: '$2',
                    paddingBottom: '$2',
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
