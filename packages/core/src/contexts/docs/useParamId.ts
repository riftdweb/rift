import { useParams } from 'react-router-dom'

export function useParamId(): string {
  // Include so provider rerenders on path change
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _params = useParams()
  // manually get userId from route because provider is above Route switch
  const pathParts = window.location.hash.split('/')
  const paramId = (pathParts[1] === 'docs' && pathParts[2]) || undefined

  return paramId
}
