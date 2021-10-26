import React from 'react'
import { Flex, Heading, Text } from '@riftdweb/design-system'

type Props = {
  title?: string
  message?: string
}

export function NonIdealState({ title, message }: Props) {
  return (
    <Flex
      css={{
        flexDirection: 'column',
        alignItems: 'center',
        gap: '$2',
        margin: '30px auto',
        color: '$gray11',
      }}
    >
      {title && <Heading size="1">{title}</Heading>}
      {message && (
        <Text
          size="2"
          css={{ color: '$gray11', textAlign: 'center', lineHeight: '16px' }}
        >
          {message}
        </Text>
      )}
    </Flex>
  )
}
