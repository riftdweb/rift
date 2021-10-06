import {
  ClockIcon,
  EyeClosedIcon,
  EyeOpenIcon,
  QuestionMarkCircledIcon,
  ThickArrowUpIcon,
} from '@radix-ui/react-icons'
import {
  Button,
  Box,
  ControlGroup,
  Flex,
  Input,
  Text,
  Tooltip,
} from '@riftdweb/design-system'
import { useFeed, Link } from '@riftdweb/core'
import { RelativeTime } from '../_shared/RelativeTime'
import { FeedContextMenu } from './FeedContextMenu'

type Props = {
  setEditing: () => void
}

export function ControlsInactive({ setEditing }: Props) {
  const {
    current,
    mode,
    setMode,
    isVisibilityEnabled,
    setIsVisibilityEnabled,
  } = useFeed()

  return (
    <Flex css={{ flexDirection: 'column' }}>
      <Input onClick={() => setEditing()} placeholder="Whats on your mind?" />
      <Flex
        css={{
          alignItems: 'center',
          gap: '$1',
          paddingTop: '$3',
        }}
      >
        <Box
          css={{
            display: 'none',
            '@bp1': { display: 'block' },
          }}
        >
          {current.loadingState ? (
            <Text size="1" css={{ color: '$gray900' }}>
              {current.loadingState}...
            </Text>
          ) : (
            <RelativeTime
              time={current.response.data?.updatedAt}
              prefix="Feed generated"
            />
          )}
        </Box>
        <Box css={{ flex: 1, display: 'none', '@bp1': { display: 'block' } }} />
        <ControlGroup>
          <Tooltip align="end" content="Top">
            <Button
              variant={mode === 'top' ? 'blue' : 'gray'}
              onClick={() => setMode('top')}
            >
              <Box css={{ mr: '$1' }}>
                <ThickArrowUpIcon />
              </Box>
              Top
            </Button>
          </Tooltip>
          <Tooltip align="end" content="Latest">
            <Button
              variant={mode === 'latest' ? 'blue' : 'gray'}
              onClick={() => setMode('latest')}
            >
              <Box css={{ mr: '$1' }}>
                <ClockIcon />
              </Box>
              Latest
            </Button>
          </Tooltip>
          <FeedContextMenu />
        </ControlGroup>
        <Box css={{ flex: 1, display: 'block', '@bp1': { display: 'none' } }} />
        <ControlGroup>
          <Tooltip align="end" content="Toggle algorithmic transparency">
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
            to="/feed/top/insights"
            tooltipAlign="end"
            content="Explore your top feed algorithm"
          >
            <QuestionMarkCircledIcon />
          </Link>
        </ControlGroup>
      </Flex>
    </Flex>
  )
}
