import { usePortal } from './usePortal'

export const useLink = (link: string) => {
  const { portal } = usePortal()
  let hnsDomain = ''

  let hostname = link ? new URL(link).hostname : undefined

  let isHns = false
  if (link) {
    const hostnameParts = hostname.split('.')
    isHns = hostnameParts[1] === 'hns'
  }

  // Format: sia://skychess.hns/#/watch/...
  if (link && link.includes('sia://') && isHns) {
    link = link.replace('sia://', '')
    const parts = link.split('.hns')
    const hnsName = parts[0]
    hnsDomain = `${hnsName}.hns`
    link = `https://${hnsDomain}.${portal}${parts[1]}`
  }

  // Format: https://skychess.hns.siasky.net/#/watch/...
  if (link && isHns) {
    const _link = link.replace('https://', '')
    const parts = _link.split('.hns')
    const hnsName = parts[0]
    hnsDomain = `${hnsName}.hns`
  }

  return {
    hostname,
    hnsDomain,
    link,
  }
}
