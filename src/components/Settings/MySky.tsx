import {
  Box,
  Button,
  Flex,
  Heading,
  Paragraph,
  Tooltip,
} from '@modulz/design-system'
import React from 'react'
import { useSkynet } from '../../hooks/skynet'
import { MySkyLoggedIn } from './MySkyLoggedIn'

export function MySky() {
  const { userId, login } = useSkynet()

  if (userId) {
    return <MySkyLoggedIn />
  }

  return (
    <Box css={{ margin: '$3 0' }}>
      <Flex css={{ flexDirection: 'column', gap: '$2' }}>
        <Heading>MySky</Heading>
        <Flex css={{ gap: '$1', alignItems: 'center', marginTop: '$2' }}>
          <Paragraph css={{ color: '$gray900' }}>
            Currently not logged in to a MySky identity.
          </Paragraph>
          <Box css={{ flex: 1 }} />
          <Tooltip content="Log in to MySky">
            <Button onClick={() => login()}>
              Log in or create a new MySky identity
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
    </Box>
  )
}
