import { Box, Heading, Text } from '@riftdweb/design-system'

type Props = {
  title: string
  description: string
}

export const LandingCard = ({ title, description }: Props) => (
  <Box>
    <Heading size="1">{title}</Heading>
    <Text size="3" css={{ color: '$slate10', lineHeight: '23px' }}>
      {description}
    </Text>
  </Box>
)
