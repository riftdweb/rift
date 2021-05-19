import {
  EyeClosedIcon,
  EyeOpenIcon,
  QuestionMarkCircledIcon,
} from '@radix-ui/react-icons'
import { Button, Flex, Input, Tooltip } from '@riftdweb/design-system'
import { useFeed } from '../../../hooks/feed'
import { Link } from '../../_shared/Link'

type Props = {
  setEditing: () => void
}

export function ControlsInactive({ setEditing }: Props) {
  const { isVisibilityEnabled, setIsVisibilityEnabled } = useFeed()

  return (
    <Flex css={{ gap: '$1' }}>
      <Input onClick={() => setEditing()} placeholder="Whats on your mind?" />
      <Flex>
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
      </Flex>
    </Flex>
  )
}
