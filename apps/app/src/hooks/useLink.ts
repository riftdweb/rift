import { usePortal } from './usePortal'

export const useLink = (link: string) => {
  const { portal } = usePortal()
  let hnsDomain = ''

  let hostname = link ? new URL(link).hostname : undefined

  // Format: sia://skychess.hns/#/watch/...
  if (link && link.includes('sia://') && link.includes('.hns')) {
    link = link.replace('sia://', '')
    const parts = link.split('.hns')
    const hnsName = parts[0]
    hnsDomain = `${hnsName}.hns`
    link = `https://${hnsDomain}.${portal}${parts[1]}`
  }

  // Format: https://skychess.hns.siasky.net/#/watch/...
  if (link && hostname.split('.')[1] === 'hns') {
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
