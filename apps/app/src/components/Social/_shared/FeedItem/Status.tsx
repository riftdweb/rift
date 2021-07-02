import { CheckIcon } from '@radix-ui/react-icons'
import { Box, Flex } from '@riftdweb/design-system'
import { Entry } from '../../../../hooks/feed/types'

type Props = { entry: Entry }

export function Status({ entry }: Props) {
  const { isPending } = entry
  return (
    <Flex
      css={{
        position: 'relative',
        left: '-3px',
        color: isPending ? '$gray700' : '$green700',
      }}
    >
      <Box>
        <CheckIcon />
      </Box>
      {!isPending && (
        <Box css={{ position: 'absolute', left: '5px' }}>
          <CheckIcon />
        </Box>
      )}
    </Flex>
  )
}
