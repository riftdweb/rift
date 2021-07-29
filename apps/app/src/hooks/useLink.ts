import { usePortal } from './usePortal'

export const useLink = (link: string) => {
  const { portal } = usePortal()
  let hnsDomain = ''

  // Format: sia://skychess.hns/#/watch/...
  if (link && link.includes('sia://') && link.includes('hns')) {
    link = link.replace('sia://', '')
    const parts = link.split('.hns')
    const hnsName = parts[0]
    hnsDomain = `${hnsName}.hns`
    link = `https://${hnsDomain}.${portal}${parts[1]}`
  }

  // Format: https://skychess.hns.siasky.net/#/watch/...
  if (link && link.includes('hns')) {
    const _link = link.replace('https://', '')
    const parts = _link.split('.hns')
    const hnsName = parts[0]
    hnsDomain = `${hnsName}.hns`
  }

  let hostname = link ? new URL(link).hostname : undefined
  return {
    hostname,
    hnsDomain,
    link,
  }
}
