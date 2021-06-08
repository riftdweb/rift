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
import { useSkynet } from '../../hooks/skynet'
import { dataVersion } from '../../hooks/feed/shared'
import { Fragment, useMemo } from 'react'
import { useFeed } from '../../hooks/feed'
import SpinnerIcon from '../_icons/SpinnerIcon'

type Props = {
  userId: string
  profile: IUserProfile
  handleUnfollow?: (userId: string) => void
  variant?: ButtonVariants['variant']
  right?: string
  size?: string
}

export function UserContextMenu({
  userId,
  profile,
  handleUnfollow,
  variant = 'ghost',
  right = '0',
  size = '1',
}: Props) {
  const { userId: myUserId, dataDomain: appDomain } = useSkynet()
  const { user: feedUser, userId: viewingUserId, refreshUser } = useFeed()
  const self = userId === myUserId
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
            {!self && (
              <Fragment>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {handleUnfollow && (
                  <DropdownMenuItem onSelect={() => handleUnfollow(userId)}>
                    Unfollow
                  </DropdownMenuItem>
                )}
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
        <DropdownMenuItem
          as={RLink}
          to={`/data/mysky/${myUserId}/${appDomain}/${dataVersion}/entries/${userId}`}
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
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Copy</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => copyToClipboard(userId, 'user ID')}>
          User ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
