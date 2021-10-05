import { useCallback } from 'react'
// import { useParams } from 'react-router-dom'

export const DATA_BASE_PATH = '/data'
export const DATA_MYSKY_BASE_PATH = `${DATA_BASE_PATH}/mysky`

export function usePath() {
  // const { viewingUserId } = useParams()
  const getDataPath = useCallback(
    (params?: {
      userId?: string
      domainName?: string
      dataKeyName?: string
    }) => {
      // Work around apparent react-router useParams issue where it becomes
      // undefined for 1 render cycle which ends up routing to /data/mysky/undefined/...
      const viewingUserId = window.location.hash.split('/')[3]

      if (!params) {
        if (!viewingUserId) {
          return DATA_MYSKY_BASE_PATH
        }
        return `${DATA_MYSKY_BASE_PATH}/${viewingUserId}`
      }

      const { userId, domainName, dataKeyName } = params
      const nextUserId = userId || viewingUserId
      if (domainName && dataKeyName) {
        // No MySky user logged in and no viewing user id
        if (!nextUserId) {
          return DATA_MYSKY_BASE_PATH
        }

        return `${DATA_MYSKY_BASE_PATH}/${nextUserId}/${encodeURIComponent(
          domainName
        )}/${dataKeyName}`
      }
      return `${DATA_MYSKY_BASE_PATH}/${nextUserId}`
    },
    []
  )

  const getDataBasePath = useCallback(() => DATA_MYSKY_BASE_PATH, [])

  return {
    getDataPath,
    getDataBasePath,
  }
}
