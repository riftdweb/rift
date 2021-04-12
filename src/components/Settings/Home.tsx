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
import { useSkynet } from '../../hooks/skynet'
import { copyToClipboard } from '../../shared/clipboard'

export function Home() {
  const { mySky, loggedIn, userId, logout, login } = useSkynet()
  const { localRootSeed, regenerate } = useLocalRootSeed()
  const { seeds, addSeed } = useSeeds()

  const addLocalRootSeedToSkyDbTool = useCallback(() => {
    addSeed({
      name: 'Rift',
      parentSeed: localRootSeed,
      childSeed: '',
      addedAt: new Date().toISOString(),
      keys: ['skyfiles', 'seeds'],
    })
  }, [localRootSeed])

  return (
    <Box css={{ margin: '$3 0' }}>
      <Flex css={{ flexDirection: 'column', gap: '$2' }}>
        <Heading>Local root seed</Heading>
        <Paragraph css={{ color: '$gray900' }}>
          App data is saved to a locally cached seed.
          {seeds.length ? `${seeds.length} seeds` : ''}
        </Paragraph>
        <Flex css={{ gap: '$1', alignItems: 'center', marginTop: '$2' }}>
          <Tooltip content="Copy local seed to clipboard">
            <Button
              onClick={() => copyToClipboard(localRootSeed, 'local root seed')}
            >
              <Box css={{ mr: '$1' }}>
                <ClipboardIcon />
              </Box>
              Copy to clipboard
            </Button>
          </Tooltip>
          <Tooltip content="Show seed and data keys in the SkyDB tool">
            <Button onClick={() => addLocalRootSeedToSkyDbTool()}>
              Add to SkyDB Tool
            </Button>
          </Tooltip>
          <Box css={{ flex: 1 }} />
          <Tooltip content="Regenerating Rift seed will clear all data">
            <Button variant="red" onClick={() => regenerate()}>
              Regenerate
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
    </Box>
  )
}
