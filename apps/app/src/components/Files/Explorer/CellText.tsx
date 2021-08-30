import { Box, Text } from '@riftdweb/design-system'

type Props = {
  css?: {}
  textCss?: {}
  children?: React.ReactNode
}

export function CellText({ css, textCss, children }: Props) {
  return (
    <Box
      css={{
        flex: 1,
        overflow: 'hidden',
        ...css,
      }}
    >
      <Text
        css={{
          color: '$gray900',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          lineHeight: '20px',
          ...textCss,
        }}
      >
        {children}
      </Text>
    </Box>
  )
}
