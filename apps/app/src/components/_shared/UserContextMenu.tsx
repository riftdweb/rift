import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import {
  Button,
  ButtonVariants,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
} from '@riftdweb/design-system'
import { copyToClipboard } from '../../shared/clipboard'
import { Link as RLink } from 'react-router-dom'
import { useSkynet } from '../../contexts/skynet'
import { isFollowing } from '../../contexts/users'
import { Fragment, useMemo } from 'react'
import { useFeed } from '../../contexts/feed'
import SpinnerIcon from '../_icons/SpinnerIcon'
import { useUsers } from '../../contexts/users'
import { DATA_PRIVATE_FEATURES } from '../../shared/config'
import { getDataKeyFeeds } from '../../shared/dataKeys'
import { useUser } from '../../hooks/useUser'
import { syncUserForInteractionAndForce } from '../../workers/workerUpdateUser'

type Props = {
  userId: string
  variant?: ButtonVariants['variant']
  right?: string
  size?: string
}

export function UserContextMenu({
  userId,
  variant = 'ghost',
  right = '0',
  size = '1',
}: Props) {
  const { controlRef: ref, myUserId, appDomain } = useSkynet()
  const user = useUser(userId)
  const profile = user?.profile
  const { user: feedUser, userId: viewingUserId } = useFeed()
  const { handleFollow, handleUnfollow } = useUsers()

  const isMyself = userId === myUserId
  const isViewingUser = userId === viewingUserId

  const loadingState = useMemo(() => feedUser.getLoadingState(userId), [
    feedUser,
    userId,
  ])

  const combinedLoadingState =
    loadingState ||
    (isViewingUser && feedUser.response.isValidating && 'Fetching feed')

  return (
    <DropdownMenu>
      <Tooltip align="end" content={combinedLoadingState || 'Open user menu'}>
        <DropdownMenuTrigger
          as={Button}
          variant={variant}
          size={size}
          css={{
            right,
            position: 'relative',
            color: '$gray500',
            '&:hover': {
              color: '$gray900',
            },
          }}
        >
          {combinedLoadingState ? <SpinnerIcon /> : <DotsHorizontalIcon />}
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
            {!isMyself && isFollowing(user) && (
              <Fragment>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => handleUnfollow(userId)}>
                  Unfollow
                </DropdownMenuItem>
              </Fragment>
            )}
            {!isMyself && !isFollowing(user) && (
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
          onSelect={() => syncUserForInteractionAndForce(ref, userId)}
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
              backgroundColor: '$blue800',
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
                backgroundColor: '$blue800',
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
