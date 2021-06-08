import { Box, Flex, Text } from '@riftdweb/design-system'

type Props = {
  title: string
  contextMenu?: React.ReactNode
}

export function StickyHeading({ title, contextMenu }: Props) {
  return (
    <Box
      css={{
        top: 0,
        backgroundColor: '$loContrast',
        position: 'sticky',
        zIndex: 1,
        borderBottom: '1px solid $gray200',
        paddingBottom: '$1',
      }}
    >
      <Flex
        css={{
          alignItems: 'center',
          height: '30px',
        }}
      >
        <Text
          css={{
            color: '$gray900',
            fontWeight: '600',
            flex: 1,
          }}
        >
          {title}
        </Text>
        <Box>{contextMenu}</Box>
      </Flex>
    </Box>
  )
}
