import { CheckIcon } from '@radix-ui/react-icons'
import { Box, Flex } from '@riftdweb/design-system'
import { Entry } from '@riftdweb/types'

type Props = { entry: Entry }

export function Status({ entry }: Props) {
  const { isPending } = entry
  return (
    <Flex
      css={{
        position: 'relative',
        left: '-3px',
        color: isPending ? '$gray8' : '$green8',
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
