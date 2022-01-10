export const getTokenName = (userId: string, resourceName: string) =>
  `users/${userId}/sync/${resourceName}`
export const getLogName = (userId: string, resourceName?: string) =>
  `users/${userId.slice(0, 5)}/sync${resourceName ? `/${resourceName}` : ''}`
