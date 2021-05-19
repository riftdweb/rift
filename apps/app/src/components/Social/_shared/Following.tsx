import { Avatar, Flex, Text } from '@riftdweb/design-system'

// from RSS bot
export const reddit = {
  name: 'Reddit',
  sections: ['Popular', 'Tech', 'CryptoCurrency', 'Siacoin'],
}

export const cnn = {
  name: 'CNN',
  sections: ['Top Stories', 'World', 'US', 'Money Latest'],
}

function Follow({ name, section }) {
  return (
    <Flex
      css={{
        alignItems: 'center',
        gap: '$1',
      }}
    >
      <Avatar size="2" />
      <Text
        size="2"
        css={{
          color: '$hiContrast',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name + ' ' + section}
      </Text>
    </Flex>
  )
}

export function Following() {
  return (
    <Flex
      css={{
        position: 'sticky',
        top: 0,
        flexDirection: 'column',
        gap: '$3',
        width: '200px',
        pt: '$3',
      }}
    >
      <Text
        css={{
          color: '$gray900',
          fontWeight: '600',
        }}
      >
        Following
      </Text>
      <Flex
        css={{
          flexDirection: 'column',
          width: '100%',
          gap: '$2',
        }}
      >
        <Follow name="Hacker News" section="Top" />
        {reddit.sections.map((section) => (
          <Follow key={'Reddit' + section} name="Reddit" section={section} />
        ))}
        {cnn.sections.map((section) => (
          <Follow key={'CNN' + section} name="CNN" section={section} />
        ))}
      </Flex>
    </Flex>
  )
}
