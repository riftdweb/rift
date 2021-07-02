import { useEffect, useState } from 'react'

export function useHasNoEntries(data) {
  const [hasValidated, setHasValidated] = useState<boolean>(false)
  const [userHasNoEntities, setUserHasNoEntities] = useState<boolean>(false)

  // Track whether the user has no entities yet so that we can adjust
  // how data validating states are handled
  useEffect(() => {
    if (!hasValidated && data) {
      setHasValidated(true)
      setUserHasNoEntities(!data.data || !data.data.length)
    }
  }, [data, hasValidated, setHasValidated, setUserHasNoEntities])

  return userHasNoEntities
}
