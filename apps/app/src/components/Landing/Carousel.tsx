import { Badge, Flex } from '@riftdweb/design-system'
import docs from './images/docs.png'
import social from './images/social.png'
import files from './images/files.png'
import dev from './images/dev.png'

import algoVisualize from './images/algo-visualize.png'
import algoInsights from './images/algo-insights.png'
import algoTune from './images/algo-tune.png'

import { useCallback, useEffect, useState } from 'react'

const imageMap = {
  docs,
  social,
  files,
  dev,
  algoVisualize,
  algoInsights,
  algoTune,
}

type ImageName = keyof typeof imageMap

type ImageItemProp = {
  title: string
  image: ImageName
}

type ImageItem = {
  title: string
  image: ImageName
  url: string
}

export function useCarousel(items: ImageItemProp[]) {
  const [intervalKey, setIntervalKey] = useState<number>(Math.random())

  const _items: ImageItem[] = items.map((item) => ({
    ...item,
    url: imageMap[item.image],
  }))
  const [currentItem, _setCurrentItem] = useState<ImageItem>(_items[0])

  const setCurrentItem = useCallback(
    (item: ImageItem) => {
      _setCurrentItem(item)
      setIntervalKey(Math.random())
    },
    [_setCurrentItem, setIntervalKey]
  )

  useEffect(() => {
    const interval = setInterval(() => {
      _setCurrentItem((currentItem) => {
        const index = _items.findIndex(
          (item) => item.image === currentItem.image
        )
        const nextIndex = index === _items.length - 1 ? 0 : index + 1
        const nextImage = _items[nextIndex]
        return nextImage
      })
    }, 10_000)

    return () => {
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalKey])

  return {
    items: _items,
    currentItem,
    setCurrentItem,
  }
}

type CarouselTagsProps = {
  items: ImageItem[]
  setCurrentItem: (item: ImageItem) => void
  currentItem: ImageItem
}

export function CarouselTags({
  currentItem,
  setCurrentItem,
  items,
}: CarouselTagsProps) {
  return (
    <Flex
      css={{
        textAlign: 'center',
        gap: '$1',
        justifyContent: 'center',
        flexWrap: 'wrap',
        '@bp2': {
          flexWrap: 'inherit',
        },
      }}
    >
      {items.map((item) => (
        <Badge
          key={item.url}
          size="1"
          onClick={() => setCurrentItem(item)}
          variant={currentItem.image === item.image ? 'blue' : undefined}
          css={{
            marginBottom: '2px',
            cursor: 'pointer',
            // size="2"
            '@bp2': {
              height: '$5',
              px: '$2',
              fontSize: '$2',
            },
          }}
          interactive
        >
          {item.title}
        </Badge>
      ))}
    </Flex>
  )
}
