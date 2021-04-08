import {
  Box,
  Button,
  ControlGroup,
  Flex,
  Heading,
  Input,
  Paragraph,
  Tooltip,
} from '@modulz/design-system'
import { ClipboardIcon } from '@radix-ui/react-icons'
import React, { useCallback } from 'react'
import { useLocalRootSeed } from '../../hooks/useLocalRootSeed'
import { useSeeds } from '../../hooks/useSeeds'
import { copyToClipboard } from '../../shared/clipboard'

export function Home() {
  const { localRootSeed, regenerate } = useLocalRootSeed()
  const { addSeed } = useSeeds()

  const addLocalRootSeedToSkyDbTool = useCallback(() => {
    addSeed({
      id: '',
      name: 'Rift',
      parentSeed: localRootSeed,
      childSeed: '',
      addedAt: new Date().toISOString(),
      keys: ['uploads', 'seeds'],
    })
  }, [localRootSeed])

  return (
    <Box css={{ margin: '$3 0' }}>
      <Flex css={{ flexDirection: 'column', gap: '$2' }}>
        <Heading>Local root seed</Heading>
        <Paragraph css={{ color: '$gray900' }}>
          App data is saved to this locally cached seed. Once MySky has been
          released, Rift will allow logged out users to sign in and save this
          data to their MySky account.
        </Paragraph>
        <Flex css={{ gap: '$1', alignItems: 'center', marginTop: '$2' }}>
          <ControlGroup>
            <Input
              css={{ color: '$gray900 !important', width: '300px' }}
              disabled
              value={localRootSeed}
            />
            <Button
              onClick={() => copyToClipboard(localRootSeed, 'local root seed')}
            >
              <ClipboardIcon />
            </Button>
          </ControlGroup>
          <Box css={{ flex: 1 }} />
          <Tooltip content="Regenerating Rift seed will clear all data">
            <Button variant="red" onClick={() => regenerate()}>
              Regenerate
            </Button>
          </Tooltip>
          <Tooltip content="Show all Rift seed and all data keys in the SkyDB tool">
            <Button onClick={() => addLocalRootSeedToSkyDbTool()}>
              Add to SkyDB Tool
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
    </Box>
  )
}
