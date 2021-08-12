import { PlusIcon } from '@radix-ui/react-icons'
import { Box, Flex, Heading, Text } from '@riftdweb/design-system'
import useLocalStorageState from 'use-local-storage-state'
import { useDomainParams } from '../../../hooks/useDomainParams'
import { DragSizing } from '../../_shared/DragSizing'
import { AddDomain } from '../_shared/AddDomain'
import { KeyEditor } from './KeyEditor'
import { KeysTree } from './KeysTree'
import { ViewingUser } from './ViewingUser'

export function KeysWorkspace() {
  const { domain, domainKey, viewingUserId } = useDomainParams()
  const [keysTreeWidth] = useLocalStorageState<string>('keysTreeWidth', '200px')

  const editorRemountKey = `${viewingUserId}/${domainKey}`

  return (
    <Flex>
      <Flex
        css={{
          padding: '$1 $2 0 0',
          height: '100vh',
          flexDirection: 'column',
          gap: '$1',
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
      <Flex css={{ flex: 1 }}>
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
                }}
              >
                <Heading css={{ textAlign: 'center', marginBottom: '$3' }}>
                  Skynet data explorer
                </Heading>
                <Text
                  css={{
                    color: '$gray900',
                    textAlign: 'center',
                    marginBottom: '$3',
                    maxWidth: '400px',
                  }}
                >
                  Add a data domain to get started, and then open a file with
                  the menu on the left.
                </Text>
                <Box css={{ textAlign: 'center' }}>
                  <AddDomain variant="gray">
                    <Box css={{ mr: '$1' }}>
                      <PlusIcon />
                    </Box>
                    Add Domain
                  </AddDomain>
                </Box>
              </Box>
            </Box>
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}
