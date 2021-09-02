import { Skyfile } from '@riftdweb/types'
import path from 'path-browserify'
import { getReasonPhrase } from 'http-status-codes'

export const getRelativeFilePath = (filepath: string): string => {
  const { root, dir, base } = path.parse(filepath)
  const relative = path
    .normalize(dir)
    .slice(root.length)
    .split(path.sep)
    .slice(1)

  return path.join(...relative, base)
}

export const getRootDirectory = (skyfile: Skyfile): string => {
  const { root, dir } = path.parse(skyfile.metadata!.path)

  return path.normalize(dir).slice(root.length).split(path.sep)[0]
}

export const createUploadErrorMessage = (error) => {
  // The request was made and the server responded with a status code that falls out of the range of 2xx
  if (error.response) {
    if (error.response.data.message) {
      return `Upload failed with error: ${error.response.data.message}`
    }

    const statusCode = error.response.status
    const statusText = getReasonPhrase(error.response.status)

    return `Upload failed, our server received your request but failed with status code: ${statusCode} ${statusText}`
  }

  // The request was made but no response was received. The best we can do is detect whether browser is online.
  // This will be triggered mostly if the server is offline or misconfigured and doesn't respond to valid request.
  if (error.request) {
    if (!navigator.onLine) {
      return 'You are offline, please connect to the internet and try again'
    }

    return 'Server failed to respond to your request, please try again later.'
  }

  return `Critical error, please refresh the application and try again. ${error.message}`
}
