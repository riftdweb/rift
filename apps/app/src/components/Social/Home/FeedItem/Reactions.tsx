import { AvatarGroup, Box, Flex } from '@riftdweb/design-system'

type Props = {}

export function Reactions({}: Props) {
  const reactions = ['🥰️', '👍', '😥', '😮', '😡']
  return (
    <Flex
      css={{
        '& div': {
          marginRight: '-$1',
        },
      }}
    >
      {reactions.map((reaction, i) => (
        <Box
          css={{
            zIndex: reactions.length - 1 - i,
            transition: 'transform 0.1s',
            '&:hover': {
              cursor: 'pointer',
              transform: 'scale(1.4)',
              zIndex: reactions.length,
            },
          }}
        >
          {reaction}
        </Box>
      ))}
    </Flex>
  )
}
