import { ClipboardIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Flex,
  Heading,
  Paragraph,
  Tooltip,
} from '@riftdweb/design-system'
import { useLocalRootSeed, copyToClipboard } from '@riftdweb/core'
import { useAccount } from '@riftdweb/core/src/hooks/useAccount'

export function LocalSeed() {
  const { myUserId } = useAccount()
  const { localRootSeed, regenerate } = useLocalRootSeed()

  return (
    <Box css={{ marginTop: '$9' }}>
      <Flex css={{ flexDirection: 'column', gap: '$2' }}>
        <Heading
          css={{
            borderBottom: '1px solid $gray4',
            paddingBottom: '$2',
            marginBottom: '$2',
          }}
        >
          Local seed
        </Heading>
        <Paragraph css={{ color: '$gray11', fontSize: '$3' }}>
          Using Rift without a MySky indentity saves App data to a locally
          cached seed.{' '}
          {myUserId && 'Log out of MySky to switch back to this data.'}
        </Paragraph>
        <Flex css={{ gap: '$1', alignItems: 'center', marginTop: '$2' }}>
          <Tooltip content="Copy local seed to clipboard">
            <Button
              onClick={() => copyToClipboard(localRootSeed, 'local root seed')}
            >
              <Box css={{ mr: '$1' }}>
                <ClipboardIcon />
              </Box>
              Copy seed to clipboard
            </Button>
          </Tooltip>
          <Box css={{ flex: 1 }} />
          <Tooltip content="Regenerating Rift seed will clear all data">
            <Button
              variant="red"
              disabled={!!myUserId}
              onClick={() => regenerate()}
            >
              Regenerate
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
    </Box>
  )
}
