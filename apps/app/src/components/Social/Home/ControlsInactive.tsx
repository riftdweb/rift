import {
  ClockIcon,
  EyeClosedIcon,
  EyeOpenIcon,
  QuestionMarkCircledIcon,
  ThickArrowUpIcon,
  UpdateIcon,
} from '@radix-ui/react-icons'
import {
  Button,
  Box,
  ControlGroup,
  Flex,
  Input,
  Tooltip,
} from '@riftdweb/design-system'
import { useFeed } from '../../../hooks/feed'
import { Link } from '../../_shared/Link'
import { RelativeTime } from '../_shared/RelativeTime'

type Props = {
  setEditing: () => void
}

export function ControlsInactive({ setEditing }: Props) {
  const {
    topFeedResponse,
    mode,
    setMode,
    refreshTopFeed,
    isVisibilityEnabled,
    setIsVisibilityEnabled,
  } = useFeed()

  return (
    <Flex css={{ flexDirection: 'column' }}>
      <Input onClick={() => setEditing()} placeholder="Whats on your mind?" />
      <Flex css={{ alignItems: 'center', gap: '$1', paddingTop: '$3' }}>
        {mode === 'top' && (
          <RelativeTime
            time={topFeedResponse.data?.updatedAt}
            prefix="Feed generated"
          />
        )}
        <Box css={{ flex: 1 }} />
        <ControlGroup>
          <Tooltip align="end" content="Top">
            <Button
              variant={mode === 'top' ? 'blue' : 'gray'}
              onClick={() => setMode('top')}
            >
              <ThickArrowUpIcon />
            </Button>
          </Tooltip>
          <Tooltip align="end" content="Latest">
            <Button
              variant={mode === 'latest' ? 'blue' : 'gray'}
              onClick={() => setMode('latest')}
            >
              <ClockIcon />
            </Button>
          </Tooltip>
          <Tooltip align="end" content="Refresh feed">
            <Button onClick={() => refreshTopFeed()}>
              <UpdateIcon />
            </Button>
          </Tooltip>
        </ControlGroup>
        <ControlGroup>
          <Tooltip align="end" content="Toggle algorithmic visibility">
            <Button
              variant="ghost"
              css={{ mixBlendMode: 'inherit' }}
              onClick={() => setIsVisibilityEnabled(!isVisibilityEnabled)}
            >
              {isVisibilityEnabled ? <EyeOpenIcon /> : <EyeClosedIcon />}
            </Button>
          </Tooltip>
          <Link
            as="button"
            to="/feed/insights"
            tooltipAlign="end"
            content="Explore your feed algorithm"
          >
            <QuestionMarkCircledIcon />
          </Link>
        </ControlGroup>
      </Flex>
    </Flex>
  )
}
