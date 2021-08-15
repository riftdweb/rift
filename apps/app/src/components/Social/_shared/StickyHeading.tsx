import { Box, Flex, Text } from '@riftdweb/design-system'

type Props = {
  title: string
  contextMenu?: React.ReactNode
  css?: {}
}

export function StickyHeading({ title, contextMenu, css = {} }: Props) {
  return (
    <Box
      css={{
        // Sometimes can see 1px of color from below
        top: '-1px',
        backgroundColor: '$loContrast',
        position: 'sticky',
        zIndex: 1,
        borderBottom: '1px solid $gray200',
        paddingBottom: '$1',
        ...css,
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
