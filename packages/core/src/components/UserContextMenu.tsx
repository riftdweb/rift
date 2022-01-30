import { Fragment } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import {
  Button,
  ButtonVariant,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
} from '@riftdweb/design-system'
import { copyToClipboard } from '../shared/clipboard'
import { Link as RLink } from 'react-router-dom'
import { handleFollow, handleUnfollow } from '../services/users'
import { syncUser } from '../services/syncUser'
import { isFollowing } from '../services/users/utils'
import { SpinnerIcon } from './_icons/SpinnerIcon'
import { DATA_PRIVATE_FEATURES } from '../shared/config'
import { getDataKeyFeeds } from '../shared/dataKeys'
import { useUser } from '../hooks/useUser'
import { useAccount } from '../hooks/useAccount'

type Props = {
  userId: string
  variant?: ButtonVariant
  right?: string
  size?: '1' | '2'
}

export function UserContextMenu({
  userId,
  variant,
  right = '0',
  size = '1',
}: Props) {
  const { myUserId, appDomain } = useAccount()
  const user = useUser(userId)
  const profile = user?.profile

  const isMyself = userId === myUserId
  const combinedLoadingState = false

  return (
    <DropdownMenu>
      <Tooltip align="end" content={combinedLoadingState || 'Open user menu'}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            ghost={!variant}
            size={size}
            css={{
              right,
              position: 'relative',
              color: '$gray6',
              '&:hover': {
                color: '$gray11',
              },
            }}
          >
            {combinedLoadingState ? <SpinnerIcon /> : <DotsHorizontalIcon />}
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end">
        {userId && (
          <Fragment>
            {profile ? (
              <DropdownMenuLabel>{profile.data.username}</DropdownMenuLabel>
            ) : (
              <DropdownMenuLabel>
                User {userId.slice(0, 6)}...
              </DropdownMenuLabel>
            )}
            {myUserId && !isMyself && isFollowing(user) && (
              <Fragment>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => handleUnfollow(userId)}>
                  Unfollow
                </DropdownMenuItem>
              </Fragment>
            )}
            {myUserId && !isMyself && !isFollowing(user) && (
              <Fragment>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => handleFollow(userId)}>
                  Follow
                </DropdownMenuItem>
              </Fragment>
            )}
          </Fragment>
        )}
        <DropdownMenuItem
          disabled={!!combinedLoadingState}
          onSelect={() => syncUser(userId, 'refresh')}
        >
          Refresh
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Data</DropdownMenuLabel>
        <DropdownMenuItem
          as={RLink}
          to={`/data/mysky/${userId}/profile-dac.hns/profileIndex.json`}
          css={{
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '$blue9',
            },
          }}
        >
          Profile
        </DropdownMenuItem>
        {DATA_PRIVATE_FEATURES && (
          <DropdownMenuItem
            as={RLink}
            to={`/data/mysky/${myUserId}/${appDomain}/${getDataKeyFeeds(
              `entries/${userId}`
            )}`}
            css={{
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: '$blue9',
              },
            }}
          >
            Feed
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Copy</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => copyToClipboard(userId, 'user ID')}>
          User ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
