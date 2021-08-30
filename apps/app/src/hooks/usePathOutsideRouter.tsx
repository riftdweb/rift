import { useParams } from 'react-router-dom'

export function usePathOutsideRouter(): string[] {
  // Include so provider rerenders on path change
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _params = useParams()
  // manually get param from route because provider is above Route switch
  const pathParts = window.location.hash.split('/')
  return pathParts.slice(1, pathParts.length).map(decodeURIComponent)
}
