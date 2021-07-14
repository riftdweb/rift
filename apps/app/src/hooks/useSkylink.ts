import { useMemo } from 'react'
import { isSkylinkV2, parseSkylink } from 'skynet-js'
import { convertSkylinkToBase32 } from 'skynet-js'
import useSWR from 'swr'
import { useSkynet } from './skynet'
import { useSelectedPortal } from './useSelectedPortal'
import bytes from 'bytes'

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
      return (
        data.metadata.subfiles['index.html'] ||
        data.metadata.subfiles['index.htm']
      )
    }
    return true
  }, [data])

  const isDirectory = useMemo(() => {
    if (data) {
      return Object.keys(data.metadata.subfiles).length > 1
    }
    return true
  }, [data])

  const size = useMemo(() => {
    if (!data) {
      return
    }
    return bytes(data.metadata.length, {
      unitSeparator: ' ',
      decimalPlaces: '1',
    })
  }, [data])

  const subfileKeys = useMemo(() => {
    if (!data) {
      return []
    }
    return Object.keys(data.metadata.subfiles)
  }, [data])

  const fileCount = useMemo(() => {
    return subfileKeys.length
  }, [subfileKeys])

  const contentType = useMemo(() => {
    if (isApp) {
      return 'text/html'
    } else if (isDirectory) {
      return 'application/zip'
    } else {
      return data?.metadata.subfiles[subfileKeys[0]].contenttype
    }
  }, [isApp, isDirectory, data, subfileKeys])

  const weblink = isApp ? weblinkSubdomain : weblinkPath

  const isV2 = skylink && isSkylinkV2(skylink)

  return {
    isApp,
    isDirectory,
    isV2,
    fileCount,
    size,
    contentType,
    skylink,
    skylinkBase32,
    weblink,
    weblinkPath,
    weblinkSubdomain,
    data,
    isValidating,
  }
}
