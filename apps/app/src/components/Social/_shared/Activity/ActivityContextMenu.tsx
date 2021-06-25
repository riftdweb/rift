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
import { Link as RLink } from 'react-router-dom'
import { useFeed } from '../../../../hooks/feed'
import { useSkynet } from '../../../../hooks/skynet'
import SpinnerIcon from '../../../_icons/SpinnerIcon'

type Props = {
  variant?: ButtonVariants['variant']
  right?: string
  size?: string
}

export function ActivityContextMenu({
  variant = 'ghost',
  right = '0',
  size = '1',
}: Props) {
  const { userId: myUserId, dataDomain: appDomain } = useSkynet()
  const { activity, refreshActivity } = useFeed()
  return (
    <DropdownMenu>
      <Tooltip
        align="end"
        content={activity.loadingState || 'Open activity menu'}
      >
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
          {activity.loadingState ? <SpinnerIcon /> : <DotsHorizontalIcon />}
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          disabled={!!activity.loadingState}
          onSelect={() => refreshActivity()}
        >
          Refresh
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Data</DropdownMenuLabel>
        <DropdownMenuItem
          as={RLink}
          to={`/data/mysky/${myUserId}/${appDomain}/activity`}
          css={{
            textDecoration: 'none',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '$blue800',
            },
          }}
        >
          Activity
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}