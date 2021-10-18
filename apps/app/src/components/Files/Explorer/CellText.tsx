import { Flex, Box, Text, Tooltip } from '@riftdweb/design-system'

type Props = {
  css?: {}
  textCss?: {}
  onClick?: () => void
  icon?: React.ReactNode
  iconContent?: string
  active?: boolean
  flex?: number
  children?: React.ReactNode
}

const activeColor = '$hiContrast'
const inactiveColor = '$gray900'

function getColor(active: boolean) {
  return active ? activeColor : inactiveColor
}

export function CellText({
  onClick,
  css,
  textCss,
  active,
  children,
  flex = 1,
  icon,
  iconContent,
}: Props) {
  return (
    <Flex
      onClick={onClick}
      css={{
        flex,
        alignItems: 'center',
        gap: '$1',
        overflow: 'hidden',
        ...css,
      }}
    >
      {icon &&
        (iconContent ? (
          <Tooltip content={iconContent}>
            <Box
              css={{
                position: 'relative',
                top: '2px',
                color: getColor(active),
              }}
            >
              {icon}
            </Box>
          </Tooltip>
        ) : (
          <Box
            css={{
              position: 'relative',
              top: '2px',
              color: getColor(active),
            }}
          >
            {icon}
          </Box>
        ))}
      <Text
        css={{
          color: getColor(active),
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          lineHeight: '20px',
          ...textCss,
        }}
      >
        {children}
      </Text>
    </Flex>
  )
}
