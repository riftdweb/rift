import { useEffect, useState } from 'react'
import { Feed } from '@riftdweb/types'

export function useHasNoEntries<T>(data: Feed<T>): boolean {
  const [hasValidated, setHasValidated] = useState<boolean>(false)
  const [userHasNoEntities, setUserHasNoEntities] = useState<boolean>(false)

  // Track whether the user has no entities yet so that we can adjust
  // how data validating states are handled
  useEffect(() => {
    if (!hasValidated && data) {
      setHasValidated(true)
      setUserHasNoEntities(!data.entries || !data.entries.length)
    }
  }, [data, hasValidated, setHasValidated, setUserHasNoEntities])

  return userHasNoEntities
}
