import { Link1Icon, TriangleUpIcon } from '@radix-ui/react-icons'
import { Box, Card, Flex, Image, Text, Tooltip } from '@riftdweb/design-system'
import { useCallback, useMemo, useState } from 'react'
import { Entry } from '@riftdweb/types'
import { useFeed, useLink, Link, User } from '@riftdweb/core'
import { Keyword } from './Keyword'
import { Status } from './Status'
import { PostTime } from '../PostTime'
// import { People } from './People'
// import { Reactions } from './Reactions'

const textStyles: any = {
  lineHeight: '25px',
  display: 'inline',
}

type Props = { entry: Entry; index?: number }

export function FeedItem({ entry, index }: Props) {
  const [isHovering, setIsHovering] = useState<boolean>(false)
  const { incrementKeywords, incrementDomain, isVisibilityEnabled } = useFeed()

  const { post } = entry
  const { link, hostname, hnsDomain } = useLink(post.content.link)

  const titleElements = useMemo(() => {
    let title = post.content.title || post.content.text || ''

    if (!isVisibilityEnabled) {
      return (
        <Text
          css={{
            ...textStyles,
            overflow: 'hidden',
          }}
        >
          {title}
        </Text>
      )
    }

    if (title && entry.nlp) {
      title = entry.nlp.data.keywords
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
          return (
            acc.substring(0, start.offset) + val + acc.substring(end.offset)
          )
        }, title)
    }

    const parts = title.split(/\{\{|\}\}/g)

    return parts.map((part, i) => {
      const key = `${part}/${i}`
      if (part.startsWith('__WORD')) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, stem, value] = part.split('///')
        return (
          <Keyword
            key={key}
            value={value}
            stem={stem}
            isHovering={isHovering}
          />
        )
      }
      return (
        <Text
          key={key}
          css={{
            ...textStyles,
          }}
        >
          {part}
        </Text>
      )
    })
  }, [isVisibilityEnabled, isHovering, entry, post])

  const incrementCounters = useCallback(() => {
    const keywordStems = entry.nlp?.data.keywords.map((k) => k.stem) || []
    incrementKeywords(keywordStems)
    if (hostname) {
      incrementDomain(hostname)
    }
  }, [entry, hostname, incrementKeywords, incrementDomain])

  const userId = entry.userId

  const imageUrl = post.content.media?.image
    ? post.content.media.image.length
      ? post.content.media.image[0].url
      : (post.content.media.image as any).url
    : null

  return (
    <Card
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      css={{
        p: '$2',
        flexDirection: 'column',
        gap: '$2',
        position: 'relative',
        borderRadius: '9px',
        border:
          new Date().getTime() - entry.post.ts < 1000 * 60 * 1
            ? '2px solid $green5'
            : 'none',
      }}
    >
      <Flex css={{ gap: '$1' }}>
        {index && (
          <Tooltip
            align="start"
            content="Upvotes, reactions, and comments are coming soon"
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
                  color: '$gray10',
                  fontSize: '10px',
                }}
              >
                {index}
              </Text>
            </Box>
          </Tooltip>
        )}
        <Flex
          css={{
            flexDirection: 'column',
            // overflow: 'hidden',
            gap: '$1',
            marginLeft: index ? '26px' : 0,
            width: '100%',
          }}
        >
          <Flex
            css={{
              flexDirection: 'column',
              color: '$hiContrast',
            }}
          >
            <Box
              css={{
                flex: 1,
                // overflow: 'hidden'
              }}
            >
              {link ? (
                <Link
                  target="_blank"
                  onClick={incrementCounters}
                  href={link}
                  css={{
                    display: 'block',
                    // overflow: 'hidden',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'none',
                    },
                  }}
                >
                  {titleElements}
                </Link>
              ) : (
                titleElements
              )}
            </Box>
            {imageUrl && (
              <Box
                css={{
                  maxHeight: '200px',
                  // margin: '0 auto',
                  overflow: 'hidden',
                }}
              >
                <Image src={imageUrl} css={{ maxHeight: '100%' }} />
              </Box>
            )}
          </Flex>
          <Flex css={{ gap: '$1', alignItems: 'center' }}>
            {userId && (
              <User
                size="1"
                userId={userId}
                width="inherit"
                textCss={{
                  display: 'none',
                  '@bp1': {
                    display: 'block',
                  },
                }}
              />
            )}
            <Box css={{ flex: 1 }} />
            {link && (
              <Box
                css={{
                  display: 'block',
                  '@bp1': {
                    display: 'none',
                  },
                  margin: '0 $1',
                  color: '$gray11',
                }}
              >
                <Link target="_blank" onClick={incrementCounters} href={link}>
                  <Box
                    css={{
                      color: '$gray11',
                    }}
                  >
                    <Link1Icon />
                  </Box>
                </Link>
              </Box>
            )}
            {link &&
              (hnsDomain ? (
                <Flex
                  css={{
                    position: 'relative',
                    marginLeft: '$1',
                    display: 'none',
                    '@bp1': {
                      display: 'block',
                    },
                  }}
                >
                  <Link
                    target="_blank"
                    onClick={incrementCounters}
                    href={link}
                    css={{
                      ...textStyles,
                      fontSize: '$1',
                      color: '$violet10',
                    }}
                  >
                    {hnsDomain}
                  </Link>
                </Flex>
              ) : (
                <Flex
                  css={{
                    position: 'relative',
                    marginLeft: '$1',
                    display: 'none',
                    '@bp1': {
                      display: 'block',
                    },
                  }}
                >
                  {/* <Score domain={hostname} /> */}
                  <Link
                    target="_blank"
                    onClick={incrementCounters}
                    href={link}
                    css={{
                      ...textStyles,
                      fontSize: '$1',
                      color: '$gray11',
                    }}
                  >
                    {hostname}
                  </Link>
                </Flex>
              ))}
            <PostTime entry={entry} />
            <Status entry={entry} />
          </Flex>
        </Flex>
      </Flex>
    </Card>
  )
}
