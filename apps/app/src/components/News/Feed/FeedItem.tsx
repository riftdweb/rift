import { TriangleUpIcon } from '@radix-ui/react-icons'
import { Badge, Box, Flex, Text, Tooltip } from '@riftdweb/design-system'
import { useCallback, useMemo, useState } from 'react'
import { useFeed } from '../../../hooks/feed'
import { ProcessedPost } from '../../../hooks/feed/types'
import { Link } from '../../_shared/Link'
import { SkylinkPeek } from '../../_shared/SkylinkPeek'
import { PostTime } from '../_shared/PostTime'
import { Keyword } from './Keyword'

const textStyles: any = {
  lineHeight: '25px',
  display: 'inline',
  whiteSpace: 'pre',
}

type Props = { item: ProcessedPost; index: number }

export function FeedItem({ item, index }: Props) {
  const [isHovering, setIsHovering] = useState<boolean>(false)
  const { incrementKeywords, incrementDomain, isVisibilityEnabled } = useFeed()

  const { post, score } = item
  const { skylink: rawSkylink } = post
  const skylink = rawSkylink.replace('sia:', '')
  const { link } = post.content
  const hostname = link ? new URL(link).hostname : undefined

  const keywordStems = item.nlp.data.keywords.map((k) => k.stem)

  const titleElements = useMemo(() => {
    let title = post.content.title

    if (!isVisibilityEnabled) {
      return (
        <Text
          css={{
            ...textStyles,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </Text>
      )
    }

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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  }, [isVisibilityEnabled, isHovering, item, post])

  const incrementCounters = useCallback(() => {
    incrementKeywords(keywordStems)
    if (hostname) {
      incrementDomain(hostname)
    }
  }, [keywordStems, hostname, incrementKeywords, incrementDomain])

  return (
    <Flex
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      css={{
        py: '$3',
        flexDirection: 'column',
        gap: '$2',
        position: 'relative',
      }}
    >
      <Flex css={{ gap: '$1' }}>
        <Tooltip
          align="start"
          content="Upvotes and other content record interactions are coming soon"
        >
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
        </Tooltip>
        <Flex
          css={{
            flexDirection: 'column',
            overflow: 'hidden',
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
            <Link
              target="_blank"
              onClick={incrementCounters}
              href={post.content.link}
              css={{
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'none',
                },
              }}
            >
              {titleElements}
            </Link>
            {post.content.link && (
              <Flex css={{ position: 'relative', marginLeft: '$1' }}>
                {/* <Score domain={hostname} /> */}
                <Text css={{ ...textStyles, color: '$gray900' }}>(</Text>
                <Link
                  target="_blank"
                  onClick={incrementCounters}
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
            <SkylinkPeek skylink={skylink} />
            <Text size="1" css={{ color: '$gray900' }}>
              {score} points
            </Text>
            <Flex
              css={{
                color: '$gray900',
                alignItems: 'center',
                position: 'relative',
                top: '1px',
              }}
            >
              {post.content.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </Flex>
            <PostTime post={post} />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}
