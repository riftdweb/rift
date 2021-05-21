import { IUserProfile } from '@skynethub/userprofile-library/dist/types'
import { useMemo } from 'react'
import { useSelectedPortal } from './useSelectedPortal'

export const useAvatarUrl = (profile?: IUserProfile) => {
  const [portal] = useSelectedPortal()
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
