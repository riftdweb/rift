import { useParams } from 'react-router-dom'

export function useParamUserId(): string {
  // Include so provider rerenders on path change
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _params = useParams()
  // manually get userId from route because provider is above Route switch
  const pathParts = window.location.hash.split('/')
  const paramUserId = (pathParts[1] === 'users' && pathParts[2]) || undefined

  return paramUserId
}
