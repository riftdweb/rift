import { Badge, Box, Flex, Text } from '@modulz/design-system'
import { ProcessedPost } from '../../../hooks/feed/types'
import { Link } from '../../_shared/Link'
import { TriangleUpIcon } from '@radix-ui/react-icons'
import { formatDistance, parseISO } from 'date-fns'
import { useMemo, useState } from 'react'
import { useFeed } from '../../../hooks/feed'
import { Keyword } from './Keyword'

const textStyles: any = {
  lineHeight: '25px',
  display: 'inline',
  whiteSpace: 'pre',
}

type Props = { item: ProcessedPost; index: number }

export function FeedItem({ item, index }: Props) {
  const [isHovering, setIsHovering] = useState<boolean>(false)
  const { incrementKeywords, incrementDomain } = useFeed()

  const { post, score, scoreDetails } = item
  const { link } = post.content
  const hostname = link ? new URL(link).hostname : undefined

  const keywordStems = item.nlp.data.keywords.map((k) => k.stem)

  const elements = useMemo(() => {
    let title = post.content.title

    title = item.nlp.data.keywords
      .map((k) => ({
        value: k.matches[0].node.children[0].value,
        position: k.matches[0].node.children[0].position,
        stem: k.stem,
      }))
      // sort so that we can replace positional data without shifting offsets
      .sort((a, b) =>
        a.position.start.offset < b.position.start.offset ? 1 : -1
      )
      .reduce((acc, { value, stem, position: { start, end } }) => {
        const val = `{{__WORD///${stem}///${value}}}`
        return acc.substring(0, start.offset) + val + acc.substring(end.offset)
      }, post.content.title)

    const parts = title.split(/\{\{|\}\}/g)

    return parts.map((part, i) => {
      if (part.startsWith('__WORD')) {
        const [_, stem, value] = part.split('///')
        return <Keyword value={value} stem={stem} isHovering={isHovering} />
      }
      return (
        <Text
          css={{
            ...textStyles,
          }}
        >
          {part}
        </Text>
      )
    })
  }, [isHovering, item])

  return (
    <Flex
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => {
        incrementKeywords(keywordStems)
        if (hostname) {
          incrementDomain(hostname)
        }
      }}
      css={{
        py: '$3',
        flexDirection: 'column',
        gap: '$2',
        position: 'relative',
      }}
    >
      <Flex css={{ gap: '$1' }}>
        <Box
          css={{
            position: 'absolute',
            color: '$hiContrast',
            cursor: 'pointer',
            top: '22px',
            transform: 'scale(1.4)',
            '&:hover': {
              transform: 'scale(1.6)',
            },
          }}
        >
          <TriangleUpIcon />
          <Text
            css={{
              textAlign: 'center',
              position: 'relative',
              color: '$gray800',
              fontSize: '10px',
            }}
          >
            {index}
          </Text>
        </Box>
        <Flex
          css={{
            flexDirection: 'column',
            gap: '$1',
            marginLeft: '26px',
          }}
        >
          <Flex
            css={{
              color: '$hiContrast',
              flexWrap: 'wrap',
            }}
          >
            {elements}
            {post.content.link && (
              <Flex css={{ position: 'relative', marginLeft: '$1' }}>
                {/* <Score domain={hostname} /> */}
                <Text css={{ ...textStyles, color: '$gray900' }}>(</Text>
                <Link
                  target="_blank"
                  href={post.content.link}
                  css={{ ...textStyles, color: '$gray900' }}
                >
                  {hostname}
                </Link>
                <Text css={{ ...textStyles, color: '$gray900' }}>)</Text>
              </Flex>
            )}
          </Flex>
          <Flex css={{ gap: '$1', alignItems: 'center' }}>
            <Text css={{ color: '$gray900' }}>{score} points</Text>
            <Flex
              css={{
                color: '$gray900',
                alignItems: 'center',
                position: 'relative',
                top: '1px',
              }}
            >
              {post.content.tags.map((tag) => (
                <Badge>{tag}</Badge>
              ))}
            </Flex>
            <Text css={{ color: '$gray900' }}>
              {post.ts &&
                formatDistance(
                  parseISO(new Date(post.ts).toISOString()),
                  new Date(),
                  {
                    addSuffix: true,
                  }
                )}
            </Text>
            {isHovering && (
              <Box
                css={{
                  position: 'absolute',
                  backgroundColor: '$panel',
                  width: '200px',
                  right: 0,
                  top: 0,
                }}
              >
                {JSON.stringify(scoreDetails, null, 2)}
              </Box>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}
