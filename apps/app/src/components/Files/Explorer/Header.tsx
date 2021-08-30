import { Box, Flex } from '@riftdweb/design-system'
import { CellText } from './CellText'

export function Header() {
  return (
    <Flex
      css={{
        padding: '$2 $3',
        gap: '$1',
        borderBottom: '1px solid $gray300',
        color: '$gray900',
        fontSize: '14px',
        height: '44px',
        alignItems: 'center',
      }}
    >
      <Box css={{ width: '15px' }} />
      <CellText
        css={{
          flex: 2,
        }}
      >
        Name
      </CellText>
      <CellText>Size</CellText>
      <CellText>Type</CellText>
      <CellText
        textCss={{
          textAlign: 'right',
        }}
      >
        Last updated
      </CellText>
    </Flex>
  )
}
