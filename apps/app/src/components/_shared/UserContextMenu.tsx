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
import { IUserProfile } from '@skynethub/userprofile-library/dist/types'
import { useSkynet } from '../../contexts/skynet'
import { Fragment, useMemo } from 'react'
import { useFeed } from '../../contexts/feed'
import SpinnerIcon from '../_icons/SpinnerIcon'
import { useUsers } from '../../contexts/users'
import { DATA_PRIVATE_FEATURES } from '../../shared/config'
import { getDataKeyFeeds } from '../../shared/dataKeys'
import { useUser } from '../../hooks/useProfile'

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
  const { myUserId, appDomain } = useSkynet()
  const user = useUser(userId)
  const profile = user?.profile
  const { user: feedUser, userId: viewingUserId, refreshUser } = useFeed()
  const {
    handleFollow,
    handleUnfollow,
    checkIsFollowingUser,
    checkIsMyself,
  } = useUsers()

  const isMyself = useMemo(() => checkIsMyself(userId), [checkIsMyself, userId])
  const isFollowingUser = useMemo(() => checkIsFollowingUser(userId), [
    checkIsFollowingUser,
    userId,
  ])

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
              <DropdownMenuLabel>{profile.username}</DropdownMenuLabel>
            ) : (
              <DropdownMenuLabel>
                User {userId.slice(0, 6)}...
              </DropdownMenuLabel>
            )}
            {!isMyself && isFollowingUser && (
              <Fragment>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => handleUnfollow(userId)}>
                  Unfollow
                </DropdownMenuItem>
              </Fragment>
            )}
            {!isMyself && !isFollowingUser && (
              <Fragment>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onSelect={() => handleFollow(userId, profile)}
                >
                  Follow
                </DropdownMenuItem>
              </Fragment>
            )}
          </Fragment>
        )}
        <DropdownMenuItem
          disabled={!!combinedLoadingState}
          onSelect={() => refreshUser(userId)}
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
