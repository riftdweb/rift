import React, { Fragment } from 'react'
import { Box, Flex, Text, Tooltip } from '@riftdweb/design-system'
import { useSearch } from '../../contexts/search'
import { useUsers } from '../../contexts/users'
import { SpinnerIcon } from '../_icons/SpinnerIcon'
import { UserProfile } from '../UserProfile'

export function UserResults({ searchValue, onSelect }) {
  const { userSearchResultsPage, userSearchResultsCount } = useSearch()
  const { userCounts } = useUsers()

  const hasIndexingStarted = userCounts.discovered !== 0

  return (
    <Flex css={{ flexDirection: 'column', gap: '$2' }}>
      <Flex css={{ gap: '$2', padding: '$1 $3 $1 $3' }}>
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
        {hasIndexingStarted && (
          <Fragment>
            {!searchValue && !!userCounts.pendingIndexing && (
              <Tooltip
                content={`Indexing ${userCounts.neverBeenIndexed} users for the first time, re-indexing ${userCounts.pendingReindexing} users`}
              >
                <Text
                  css={{
                    color: '$gray600',
                  }}
                >
                  {`Indexing ${userCounts.pendingIndexing}`}
                </Text>
              </Tooltip>
            )}
            {!searchValue && (
              <Tooltip
                align="end"
                content={`Discovered ${userCounts.discovered} total users, ${userCounts.hasBeenIndexed} have been indexed`}
              >
                <Text
                  css={{
                    color: '$gray800',
                  }}
                >
                  {`Discovered ${userCounts.discovered}`}
                </Text>
              </Tooltip>
            )}
            {searchValue && (
              <Tooltip
                align="end"
                content={`${userSearchResultsCount} matching users`}
              >
                <Text
                  css={{
                    color: '$gray800',
                  }}
                >
                  {userSearchResultsCount === 1
                    ? '1 result'
                    : `${userSearchResultsCount} results`}
                </Text>
              </Tooltip>
            )}
          </Fragment>
        )}
      </Flex>
      {userSearchResultsCount ? (
        <Flex
          css={{
            flexDirection: 'column',
          }}
        >
          {userSearchResultsPage.map((userItem) => {
            return (
              <Box
                key={userItem.userId}
                css={{
                  padding: '$2 $4 $2 $3',
                  borderBottom: '1px solid $gray200',
                  transition: 'all 0.1s linear',
                  '&:last-of-type': {
                    borderBottom: 'none',
                  },
                  '&:hover': {
                    backgroundColor: '$gray100',
                  },
                }}
              >
                <UserProfile
                  user={userItem}
                  version="compact"
                  onClick={onSelect}
                />
              </Box>
            )
          })}
        </Flex>
      ) : !hasIndexingStarted ? (
        <Flex css={{ gap: '$1', color: '$gray900', padding: '$2 $4 $2 $3' }}>
          <SpinnerIcon />
          <Text css={{ color: '$gray900' }}>
            One moment, initializing search index
          </Text>
        </Flex>
      ) : (
        <Text css={{ color: '$gray900', padding: '$2 $4 $2 $3' }}>
          No results. Try searching by the user's username, first name, last
          name, about info, or location.
        </Text>
      )}
    </Flex>
  )
}
