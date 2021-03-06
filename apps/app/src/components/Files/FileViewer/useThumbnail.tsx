import { Image } from '@riftdweb/design-system'
import { useEffect, useMemo, useState } from 'react'
import { getFileThumbnailUrl, useBlurHash } from '@riftdweb/core'

const defaultSize = 20

export function useThumbnail(file, size = defaultSize) {
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    const key = file.data.ext?.thumbnail?.key
    if (!key) {
      return
    }
    const func = async () => {
      const url = await getFileThumbnailUrl(file.data)
      setUrl(url)
    }
    func()
  }, [file, setUrl])

  const aspectRatio = file.data.ext?.thumbnail?.aspectRatio || 1

  const blurHashUrl = useBlurHash(
    file.data.ext?.thumbnail?.blurHash,
    Math.floor(aspectRatio * 10),
    Math.floor((1 / aspectRatio) * 10)
  )

  const element = useMemo(() => {
    if (url) {
      return (
        <Image
          src={url}
          css={{
            objectFit: 'cover',
            width: size,
            height: size,
          }}
        />
      )
    }

    if (blurHashUrl) {
      return (
        <Image
          src={blurHashUrl}
          css={{
            objectFit: 'cover',
            width: size,
            height: size,
          }}
        />
      )
    }

    return null
  }, [blurHashUrl, url, size])

  return element
}
