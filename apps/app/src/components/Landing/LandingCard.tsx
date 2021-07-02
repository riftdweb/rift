import { Box, Subheading, Text } from '@riftdweb/design-system'

type Props = {
  title: string
  description: string
}

export const LandingCard = ({ title, description }: Props) => (
  <Box>
    <Subheading>{title}</Subheading>
    <Text size="3" css={{ color: '$slate900', lineHeight: '23px' }}>
      {description}
    </Text>
  </Box>
)
