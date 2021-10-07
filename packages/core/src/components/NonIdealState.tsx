import React from 'react'
import { Flex, Subheading, Text } from '@riftdweb/design-system'

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
        color: '$gray900',
      }}
    >
      {title && <Subheading>{title}</Subheading>}
      {message && (
        <Text
          size="2"
          css={{ color: '$gray900', textAlign: 'center', lineHeight: '16px' }}
        >
          {message}
        </Text>
      )}
    </Flex>
  )
}
