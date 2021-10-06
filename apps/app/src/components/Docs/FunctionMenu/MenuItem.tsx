import { Code, Text, Box, Button, Flex, Kbd } from '@riftdweb/design-system'
import { useDocs } from '@riftdweb/core'

type Props = {
  onClick: () => void
  isActive?: boolean
  name: string
  kbd?: (string | number)[]
  md?: string
}

export function MenuItem({ onClick, isActive, name, kbd, md }: Props) {
  const { menuMode } = useDocs()

  const color = isActive ? '$blue900' : '$hiContrast'
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      css={{
        width: '100%',
        cursor: 'pointer',
      }}
    >
      <Flex css={{ gap: '$1', width: '100%', alignItems: 'center' }}>
        <Text
          css={{
            position: 'relative',
            top: '-1px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: '20px',
            color,
            '&:hover': {
              color: '$blue800',
            },
          }}
        >
          {name}
        </Text>
        <Box css={{ flex: 1 }} />
        {menuMode === 'kbd' && kbd && (
          <Flex css={{ ml: '$1' }}>
            {kbd.map((k) => (
              <Kbd size="1" css={{ color }}>
                {k}
              </Kbd>
            ))}
          </Flex>
        )}
        {menuMode === 'md' && md && (
          <Flex css={{ ml: '$1' }}>
            <Code
              css={{
                padding: '2px',
                fontSize: '12px',
                lineHeight: '12px',
                cursor: 'pointer',
                border: '1px solid $gray400',
                borderRadius: '3px',
              }}
            >
              {md}
            </Code>
          </Flex>
        )}
      </Flex>
    </Button>
  )
}
