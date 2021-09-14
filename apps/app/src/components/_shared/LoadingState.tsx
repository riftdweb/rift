import { Flex, Text } from '@riftdweb/design-system'
import SpinnerIcon from '../_icons/SpinnerIcon'

type Props = {
  message?: string
  color?: string
  css?: {}
}

export function LoadingState({ message, css, color = '$gray900' }: Props) {
  return (
    <Flex
      css={{
        flexDirection: 'column',
        alignItems: 'center',
        gap: '$2',
        margin: '30px auto',
        color,
        ...css,
      }}
    >
      <SpinnerIcon />
      {message && (
        <Text size="2" css={{ color }}>
          {message}
        </Text>
      )}
    </Flex>
  )
}
