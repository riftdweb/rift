import { useCallback, useMemo } from 'react'
import { isSkylinkV2, parseSkylink } from 'skynet-js'
import { convertSkylinkToBase32 } from 'skynet-js'
import useSWR from 'swr'
import { useSkynet } from '../contexts/skynet'
import { usePortal } from './usePortal'
import bytes from 'bytes'
import { triggerToast } from '../shared/toast'

export const useSkylink = (rawSkylink?: string, skipFetch?: boolean) => {
  const { portal } = usePortal()
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

  const healthQuick = useSWR<{ basesectorredundancy: number }>(
    !skipFetch && skylink ? [skylink, 'healthQuick'] : null,
    async () => {
      const response = await fetch(
        `https://${portal}/skynet/health/skylink/${skylink}?timeout=5`
      )
      return await response.json()
    },
    {
      revalidateOnFocus: false,
    }
  )

  const healthFull = useSWR<{ basesectorredundancy: number }>(
    !skipFetch && skylink ? [skylink, 'healthFull'] : null,
    async () => {
      const response = await fetch(
        `https://${portal}/skynet/health/skylink/${skylink}`
      )
      return await response.json()
    },
    {
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

  const pin = useCallback(() => {
    const func = async () => {
      try {
        const response = await fetch(
          `https://${portal}/skynet/pin/${skylink}`,
          {
            method: 'post',
          }
        )
        if (response.ok) {
          triggerToast('Successfully pinned skyfile')
        } else {
          triggerToast('Error pinning skyfile', { type: 'error' })
        }
      } catch (e) {
        triggerToast('Error pinning skyfile', { type: 'error' })
      }
    }
    func()
  }, [skylink, portal])

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
    pin,
    health: {
      isEnabled: !skipFetch,
      quick: healthQuick,
      full: healthFull,
    },
  }
}
