import { IUserProfile } from '@skynethub/userprofile-library/dist/types'
import { useMemo } from 'react'
import { usePortal } from './usePortal'

export const useAvatarUrl = (profile?: IUserProfile) => {
  const {portal} = usePortal()
  return useMemo(() => {
    const avatarUrl =

      profile && profile.avatar && profile.avatar.length
        ? profile.avatar[0].url
        : null

    return avatarUrl
      ? `https://${portal}/${avatarUrl.replace('sia:', '')}`
      : undefined
  }, [portal, profile])
}
