import { IUser } from '@riftdweb/types'
import { formatDistance } from 'date-fns'
import { ControlRef } from '../../contexts/skynet/ref'
import { getConfig, Level, UserResourceKeys } from './config'

type IsUpToDateParams = {
  verbose?: boolean
  log?: (message: string) => void
}

export function checkIsUpToDate(
  user: IUser | undefined,
  resourceKey: UserResourceKeys,
  timeout: number,
  params: IsUpToDateParams = {}
) {
  if (!user) {
    return {
      isUpToDate: false,
      message: 'User undefined',
    }
  }

  const resource = user[resourceKey]

  if (!resource) {
    return {
      isUpToDate: false,
      message: 'User resource undefined',
    }
  }

  if (timeout === -1) {
    return {
      isUpToDate: true,
      message: `User resource '${resourceKey}' update disabled`,
    }
  }

  const updatedAt = resource.updatedAt

  const { verbose = false, log = console.log } = params

  const now = new Date().getTime()
  const timeSinceLastUpdate = now - updatedAt
  const isUpToDate = timeSinceLastUpdate < timeout

  const ago = formatDistance(new Date(updatedAt), new Date(), {
    addSuffix: true,
  })

  const message = `${resourceKey ? `${resourceKey} ` : ''}${
    isUpToDate ? 'current' : 'expired'
  } - updated ${ago}`

  if (verbose) {
    log(message)
  }

  return {
    isUpToDate,
    message,
  }
}

type IsUserUpToDateParams = {
  verbose?: boolean
  log?: (message: string) => void
  level?: Level
}

export function checkIsUserUpToDate(
  ref: ControlRef,
  user: IUser | undefined,
  params: IsUserUpToDateParams = {}
) {
  const { verbose = false, log = console.log, level = 'index' } = params

  if (!user) {
    return {
      isUpToDate: false,
      message: 'User undefined',
    }
  }

  const { timeouts } = getConfig(ref, user, level)

  const resourceKeys = Object.keys(timeouts) as UserResourceKeys[]

  const checks = resourceKeys.map((resourceKey) =>
    checkIsUpToDate(user, resourceKey, timeouts[resourceKey], {
      verbose,
      log,
    })
  )

  return {
    isUpToDate: !checks.find((check) => !check.isUpToDate),
    checks,
  }
}
