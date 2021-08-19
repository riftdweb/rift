import { IUser } from '@riftdweb/types'
import { formatDistance } from 'date-fns'

type UserResourceKeys = 'profile' | 'following' | 'feed'

const resourceTimeoutMap: Record<UserResourceKeys, number> = {
  profile: 1000 * 60 * 60,
  following: 1000 * 60 * 30,
  feed: 1000 * 60 * 20,
}

type IsUpToDateParams = {
  verbose?: boolean
  log?: (message: string) => void
}

export function checkIsUpToDate(
  user: IUser | undefined,
  resource: UserResourceKeys,
  params: IsUpToDateParams = {}
) {
  if (!user) {
    return {
      isUpToDate: false,
      message: 'User undefined',
    }
  }
  const updatedAt = user[resource].updatedAt
  const timeout = resourceTimeoutMap[resource]

  const { verbose = false, log = console.log } = params

  const now = new Date().getTime()
  const timeSinceLastUpdate = now - updatedAt
  const isUpToDate = timeSinceLastUpdate < timeout

  const ago = formatDistance(new Date(updatedAt), new Date(), {
    addSuffix: true,
  })

  const message = `${resource ? `${resource} ` : ''}${
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
  include?: UserResourceKeys[]
  verbose?: boolean
  log?: (message: string) => void
}

export function checkIsUserUpToDate(
  user: IUser | undefined,
  params: IsUserUpToDateParams = {}
) {
  const {
    include = ['profile', 'following'],
    verbose = false,
    log = console.log,
  } = params

  if (!user) {
    return {
      isUpToDate: false,
      message: 'User undefined',
    }
  }

  const checks = include.map((resource) =>
    checkIsUpToDate(user, resource, {
      verbose,
      log,
    })
  )

  return {
    isUpToDate: !checks.find((check) => !check.isUpToDate),
    checks,
  }
}
