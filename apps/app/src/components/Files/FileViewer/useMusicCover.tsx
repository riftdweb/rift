import { Image } from '@riftdweb/design-system'
import { useEffect, useMemo, useState } from 'react'
import { getAudioCoverUrl, useBlurHash } from '@riftdweb/core'

const defaultSize = 200

export function useMusicCover(file, size = defaultSize) {
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    const key = file.data.ext?.audio?.coverKey
    if (!key) {
      return
    }
    const func = async () => {
      const url = await getAudioCoverUrl(file.data)
      setUrl(url)
    }
    func()
  }, [file, setUrl])

  const blurHashUrl = useBlurHash(
    file.data.ext?.thumbnail?.blurHash,
    size,
    size
  )

  const element = useMemo(() => {
    if (url) {
      return <Image src={url} width={size} height={size} />
    }

    if (blurHashUrl) {
      return <Image src={blurHashUrl} width={size} height={size} />
    }

    return null
  }, [blurHashUrl, url, size])

  return element
}
