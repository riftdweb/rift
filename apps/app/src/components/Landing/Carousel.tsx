import { Badge, Flex } from '@riftdweb/design-system'
import dataUrl from './images/data.png'
import dnsUrl from './images/dns.png'
import filesSetDnsUrl from './images/files-set-dns.png'
import filesUrl from './images/files.png'
import homeUrl from './images/home.png'
import homeAlgoUrl from './images/home-algo.png'
import insightsUrl from './images/insights.png'
import profileUrl from './images/profile.png'
import postAlgoUrl from './images/post-algo.png'
import insightsSmallUrl from './images/insights-small.png'
import tuneSmallUrl from './images/tune-small.png'
import searhSkylinkUrl from './images/search-skylink.png'
import { useCallback, useEffect, useState } from 'react'

const imageMap = {
  data: dataUrl,
  dns: dnsUrl,
  filesSetDns: filesSetDnsUrl,
  files: filesUrl,
  home: homeUrl,
  homeAlgo: homeAlgoUrl,
  insights: insightsUrl,
  profile: profileUrl,
  searchSkylink: searhSkylinkUrl,
  postAlgo: postAlgoUrl,
  insightsSmall: insightsSmallUrl,
  tuneSmall: tuneSmallUrl,
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
      }}
    >
      {items.map((item) => (
        <Badge
          size="2"
          onClick={() => setCurrentItem(item)}
          variant={currentItem.image === item.image ? 'blue' : undefined}
          css={{ cursor: 'pointer' }}
          interactive
        >
          {item.title}
        </Badge>
      ))}
    </Flex>
  )
}
