import { PlusIcon } from '@radix-ui/react-icons'
import { Box, Flex, Heading, Text } from '@riftdweb/design-system'
import useLocalStorageState from 'use-local-storage-state'
import { useSkynet } from '@riftdweb/core/src/contexts/skynet'
import { useDomainParams } from '@riftdweb/core/src/hooks/useDomainParams'
import { DragSizing } from '@riftdweb/core/src/components/DragSizing'
import { LoadingState } from '@riftdweb/core/src/components/_shared/LoadingState'
import { AddDomain } from '../_shared/AddDomain'
import { KeyEditor } from './KeyEditor'
import { KeysTree } from './KeysTree'
import { ViewingUser } from './ViewingUser'

export function KeysWorkspace() {
  const { isReady } = useSkynet()
  const { domain, domainKey, viewingUserId } = useDomainParams()
  const [keysTreeWidth] = useLocalStorageState<string>('keysTreeWidth', '200px')

  const editorRemountKey = `${viewingUserId}/${domainKey}`

  return (
    <Flex
      css={{
        position: 'relative',
        height: '100vh',
      }}
    >
      <Flex
        css={{
          padding: '$1 $2 0 0',
          flexDirection: 'column',
          gap: '$1',
          display: 'none',
          '@bp3': {
            display: 'block',
          },
        }}
      >
        <ViewingUser />
        <Box
          css={{
            height: '100%',
            overflow: 'hidden',
            borderRadius: '6px',
            border: '1px solid $gray500',
            // backgroundColor: '$gray400',
            backgroundColor: '$panel',
            transition: 'background-color 0.1s',
            '&:hover': { backgroundColor: '$slate300' },
          }}
        >
          <DragSizing
            border="right"
            handlerOffset={0}
            handlerZIndex={1}
            // TODO: saving the width in local storage, hit issues, need to finish
            // onChange={({ width }) => setKeysTreeWidth(typeof width === 'number' ? `${width}px` : width)}
            style={{
              width: keysTreeWidth,
              height: '100%',
            }}
          >
            <Box
              css={{
                height: '100%',
                overflow: 'auto',
              }}
            >
              <KeysTree />
            </Box>
          </DragSizing>
        </Box>
      </Flex>
      <Flex css={{ flex: 1, overflow: 'hidden' }}>
        {domainKey ? (
          <KeyEditor
            key={editorRemountKey}
            domain={domain}
            dataKey={domainKey}
          />
        ) : (
          <Flex
            css={{
              flexDirection: 'column',
              gap: '$2',
              height: '100%',
              width: '100%',
              padding: '11px 0 0',
            }}
          >
            <Box
              css={{
                position: 'relative',
                flex: 1,
                backgroundColor: '$slate100',
                borderRadius: '4px',
              }}
            >
              <Box
                css={{
                  position: 'absolute',
                  top: '40%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100%',
                }}
              >
                <Heading css={{ textAlign: 'center', marginBottom: '$3' }}>
                  Skynet data explorer
                </Heading>
                {isReady && (
                  <Text
                    css={{
                      color: '$gray900',
                      textAlign: 'center',
                      margin: '0 auto $3 auto',
                      lineHeight: '20px',
                      maxWidth: '400px',
                      display: 'none',
                      '@bp3': {
                        display: 'block',
                      },
                    }}
                  >
                    Add a data domain to get started, and then open a file with
                    the menu on the left.
                  </Text>
                )}
                <Text
                  css={{
                    color: '$gray900',
                    textAlign: 'center',
                    margin: '0 auto $3 auto',
                    lineHeight: '20px',
                    maxWidth: '400px',
                    display: 'block',
                    '@bp3': {
                      display: 'none',
                    },
                  }}
                >
                  Open Rift on a wider screen to view and select a file from the
                  explorer menu.
                </Text>
                <Box
                  css={{
                    textAlign: 'center',
                    display: 'none',
                    '@bp3': {
                      display: 'block',
                    },
                  }}
                >
                  {isReady ? (
                    <AddDomain variant="gray">
                      <Box css={{ mr: '$1' }}>
                        <PlusIcon />
                      </Box>
                      Add Domain
                    </AddDomain>
                  ) : (
                    <LoadingState message="Initializing" />
                  )}
                </Box>
              </Box>
            </Box>
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}
