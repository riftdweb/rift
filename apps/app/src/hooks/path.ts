import { useCallback } from 'react'
import { useParams } from 'react-router-dom'

export function usePath() {
  // const { viewingUserId } = useParams()
  const getDataPath = useCallback(
    (params?: {
      userId?: string
      domainName?: string
      dataKeyName?: string
    }) => {
      // Work around apparent react-router useParams issue where it becomes
      // undefined for 1 render cycle which ends up routing to /data/undefined/...
      const viewingUserId = window.location.hash.split('/')[2]

      if (!params) {
        if (!viewingUserId) {
          return '/data'
        }
        return `/data/${viewingUserId}`
      }

      const { userId, domainName, dataKeyName } = params
      if (domainName && dataKeyName) {
        return `/data/${userId || viewingUserId}/${encodeURIComponent(
          domainName
        )}/${dataKeyName}`
      }
      return `/data/${userId || viewingUserId}`
    },
    []
  )

  return {
    getDataPath,
  }
}
