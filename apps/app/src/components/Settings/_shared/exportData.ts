import { App, Domain, Skyfile } from '@riftdweb/types'

export const exportData = (
  skyfiles: Skyfile[],
  skyDb: Domain[],
  apps: App[]
) => {
  if (apps && apps.length) {
    downloadFile('apps', apps)
  }
  if (skyfiles && skyfiles.length) {
    downloadFile('files', skyfiles)
  }
  if (skyDb && skyDb.length) {
    downloadFile('domains', skyDb)
  }
}

const downloadFile = async (name, data: {}) => {
  const fileName = name
  const json = JSON.stringify(data)
  const blob = new Blob([json], { type: 'application/json' })
  const href = await URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = href
  link.download = fileName + '.json'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
