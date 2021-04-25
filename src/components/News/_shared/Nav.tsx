import {
  Tooltip,
  Text,
  Box,
  Flex,
  Heading,
  Button,
} from '@modulz/design-system'
import {
  EyeClosedIcon,
  EyeOpenIcon,
  GearIcon,
  QuestionMarkCircledIcon,
} from '@radix-ui/react-icons'
import { Link } from '../../_shared/Link'
import capitalize from 'lodash/capitalize'
import { useFeed } from '../../../hooks/feed'

type Props = {
  section?: 'insights'
}

export function Nav({ section }: Props) {
  const { isVisibilityEnabled, setIsVisibilityEnabled } = useFeed()
  return (
    <Heading css={{ my: '$5' }}>
      <Flex css={{ gap: '$1', alignItems: 'center', height: '30px' }}>
        <Link to="/news">News</Link>
        {section && <Text>/</Text>}
        {section && (
          <Link
            css={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            to={`/news/${section}`}
          >
            {capitalize(section)}
          </Link>
        )}
        <Box css={{ flex: 1 }} />
        <Flex css={{ gap: '$1', alignItems: 'center' }}>
          <Tooltip align="end" content="Toggle algorithmic visibility">
            <Button
              variant="ghost"
              onClick={() => setIsVisibilityEnabled(!isVisibilityEnabled)}
            >
              {isVisibilityEnabled ? <EyeOpenIcon /> : <EyeClosedIcon />}
            </Button>
          </Tooltip>
          <Link
            as="button"
            to="/news/insights"
            tooltipAlign="end"
            content="Explore your feed algorithm"
          >
            <QuestionMarkCircledIcon />
          </Link>
        </Flex>
      </Flex>
    </Heading>
  )
}
