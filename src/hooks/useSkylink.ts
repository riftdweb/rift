import { useMemo } from 'react'
import { parseSkylink } from 'skynet-js'
import { convertSkylinkToBase32 } from 'skynet-js/dist/utils/skylink'
import useSWR from 'swr'
import { useSelectedPortal } from './useSelectedPortal'
import { useSkynet } from './skynet'

export const useSkylink = (rawSkylink?: string, skipFetch?: boolean) => {
  const [portal] = useSelectedPortal()
  const { Api } = useSkynet()

  const skylink = rawSkylink ? parseSkylink(rawSkylink) : null

  const { data, isValidating } = useSWR(
    !skipFetch && skylink ? [skylink, 'metadata'] : null,
    () => Api.getMetadata(skylink),
    {
      dedupingInterval: 10000,
      revalidateOnFocus: false,
    }
  )

  const skylinkBase32 = useMemo(() => {
    if (!skylink) {
      return ''
    }

    return convertSkylinkToBase32(skylink)
  }, [skylink])

  const weblinkSubdomain = useMemo(() => {
    if (!skylinkBase32) {
      return ''
    }
    return `https://${skylinkBase32}.${portal}`
  }, [skylinkBase32, portal])

  const weblinkPath = useMemo(() => {
    if (!skylink) {
      return ''
    }
    return `https://${portal}/${skylink}`
  }, [skylink, portal])

  const isApp = useMemo(() => {
    if (data) {
      return data.contentType === 'text/html'
    }
    return true
  }, [data])

  const weblink = isApp ? weblinkSubdomain : weblinkPath

  return {
    isApp,
    skylink,
    skylinkBase32,
    weblink,
    weblinkPath,
    weblinkSubdomain,
    data,
    isValidating,
  }
}
