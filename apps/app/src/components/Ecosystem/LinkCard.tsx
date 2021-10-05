import {
  Box,
  Card,
  Code,
  Flex,
  Subheading,
  Text,
} from '@riftdweb/design-system'
import { useLink } from '@riftdweb/core/src/hooks/useLink'

type Props = {
  url: string
  title: string
  description: string
}

export const LinkCard = ({ url, title, description }: Props) => {
  const { hnsDomain, hostname } = useLink(url)
  return (
    <Box>
      <Card
        as="a"
        href={url}
        target="_blank"
        css={{ p: '$3' }}
        variant="interactive"
      >
        <Subheading>{title}</Subheading>
        <Flex css={{ ai: 'center', my: '$2', flexWrap: 'wrap' }}>
          <Code>{hnsDomain || hostname}</Code>
        </Flex>
        <Text size="3" css={{ color: '$slate900', lineHeight: '23px' }}>
          {description}
        </Text>
      </Card>
    </Box>
  )
}
