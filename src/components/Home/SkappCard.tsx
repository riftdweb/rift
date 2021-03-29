import {
  Badge,
  Box,
  Card,
  Code,
  Flex,
  Subheading,
  Text,
} from '@modulz/design-system'

type Props = {
  portal: string
  hnsDomain: string
  title: string
  description: string
  tags: string[]
}

export const SkappCard = ({
  portal,
  hnsDomain,
  title,
  description,
  tags,
}: Props) => (
  <Box>
    <Card
      as="a"
      href={`https://${hnsDomain}.${portal}`}
      target="_blank"
      css={{ p: '$3' }}
      variant="interactive"
    >
      <Subheading>{title}</Subheading>
      <Flex css={{ ai: 'center', my: '$2', flexWrap: 'wrap' }}>
        <Code>{hnsDomain}</Code>
      </Flex>
      <Text size="3" css={{ color: '$slate900', lineHeight: '23px' }}>
        {description}
      </Text>
      <Flex css={{ ai: 'center', mt: '$3', flexWrap: 'wrap' }}>
        {tags.map((tag) => (
          <Badge key={tag} css={{ mr: '$1', mb: '$1' }}>
            {tag}
          </Badge>
        ))}
      </Flex>
    </Card>
  </Box>
)
