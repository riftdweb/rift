import { AxiosResponse } from 'axios'
// import { Upload } from 'tus-js-client'

// import { getFileMimeType } from './utils/file'
import { BaseCustomOptions, defaultBaseOptions } from './utils/options'
import { formatSkylink } from './skylink/format'
// import { buildRequestHeaders, buildRequestUrl, SkynetClient } from './client'
import { SkynetClient } from './client'
import {
  // throwValidationError,
  // validateObject,
  validateOptionalObject,
  validateString,
} from './utils/validation'
// import { trimSuffix } from './utils/string'
import FormData from 'form-data'
import { resolve } from 'url'

/**
 * The tus chunk size is (4MiB - encryptionOverhead) * dataPieces, set in skyd.
 */
const TUS_CHUNK_SIZE = (1 << 22) * 10

/**
 * The retry delays, in ms. Data is stored in skyd for up to 20 minutes, so the
 * total delays should not exceed that length of time.
 */
const DEFAULT_TUS_RETRY_DELAYS = [0, 5_000, 15_000, 60_000, 300_000, 600_000]

/**
 * The portal file field name.
 */
const PORTAL_FILE_FIELD_NAME = 'file'
/**
 * The portal directory file field name.
 */
const PORTAL_DIRECTORY_FILE_FIELD_NAME = 'files[]'

/**
 * Custom upload options.
 *
 * @property [endpointUpload] - The relative URL path of the portal endpoint to contact.
 * @property [endpointLargeUpload] - The relative URL path of the portal endpoint to contact for large uploads.
 * @property [endpointLargeUploadId] - The relative URL path of the portal endpoint to contact for large uploads to retrieve the skylink on success.
 * @property [customFilename] - The custom filename to use when uploading files.
 * @property [largeFileSize=41943040] - The size at which files are considered "large" and will be uploaded using the tus resumable upload protocol. This is the size of one chunk by default (40 mib).
 * @property [retryDelays=[0, 5_000, 15_000, 60_000, 300_000, 600_000]] - An array or undefined, indicating how many milliseconds should pass before the next attempt to uploading will be started after the transfer has been interrupted. The array's length indicates the maximum number of attempts.
 */
export type CustomUploadOptions = BaseCustomOptions & {
  endpointUpload?: string
  endpointLargeUpload?: string
  endpointLargeUploadId?: string

  customFilename?: string
  largeFileSize?: number
  retryDelays?: number[]
}

/**
 * The response to an upload request.
 *
 * @property skylink - 46-character skylink.
 */
export type UploadRequestResponse = {
  skylink: string
}

export const defaultUploadOptions = {
  ...defaultBaseOptions,

  endpointUpload: '/skynet/skyfile',
  endpointLargeUpload: '/skynet/tus',
  endpointLargeUploadId: '/skynet/upload/tus',

  customFilename: '',
  largeFileSize: TUS_CHUNK_SIZE,
  retryDelays: DEFAULT_TUS_RETRY_DELAYS,
}

/**
 * Uploads a file to Skynet.
 *
 * @param this - SkynetClient
 * @param file - The file to upload.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @param [customOptions.endpointUpload="/skynet/skyfile"] - The relative URL path of the portal endpoint to contact for small uploads.
 * @param [customOptions.endpointLargeUpload="/skynet/tus"] - The relative URL path of the portal endpoint to contact for large uploads.
 * @returns - The returned skylink.
 * @throws - Will throw if the request is successful but the upload response does not contain a complete response.
 */
export async function uploadFile(
  this: SkynetClient,
  // MODIFY
  // file: File,
  file: { data: any; name: string; type: string },
  customOptions?: CustomUploadOptions
): Promise<UploadRequestResponse> {
  // Validation is done in `uploadFileRequest` or `uploadLargeFileRequest`.

  const opts = {
    ...defaultUploadOptions,
    ...this.customOptions,
    ...customOptions,
  }

  // MODIFY
  // if (file.size < opts.largeFileSize) {
  return this.uploadSmallFile(file, opts)
  // } else {
  //   return this.uploadLargeFile(file, opts)
  // }
}

/**
 * Uploads a small file to Skynet.
 *
 * @param this - SkynetClient
 * @param file - The file to upload.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @param [customOptions.endpointUpload="/skynet/tus"] - The relative URL path of the portal endpoint to contact.
 * @returns - The returned skylink.
 * @throws - Will throw if the request is successful but the upload response does not contain a complete response.
 */
export async function uploadSmallFile(
  this: SkynetClient,
  // MODIFY
  // file: File,
  file: { data: any; name: string; type: string },
  customOptions: CustomUploadOptions
): Promise<UploadRequestResponse> {
  const response = await this.uploadSmallFileRequest(file, customOptions)

  // Sanity check.
  validateUploadResponse(response)

  const skylink = formatSkylink(response.data.skylink)

  return { skylink }
}

/**
 * Makes a request to upload a small file to Skynet.
 *
 * @param this - SkynetClient
 * @param file - The file to upload.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @param [customOptions.endpointPath="/skynet/skyfile"] - The relative URL path of the portal endpoint to contact.
 * @returns - The upload response.
 */
export async function uploadSmallFileRequest(
  this: SkynetClient,
  // MODIFY
  // file: File,
  file: { data: any; name: string; type: string },
  customOptions?: CustomUploadOptions
): Promise<AxiosResponse> {
  // validateFile('file', file, 'parameter')
  validateOptionalObject(
    'customOptions',
    customOptions,
    'parameter',
    defaultUploadOptions
  )

  const opts = {
    ...defaultUploadOptions,
    ...this.customOptions,
    ...customOptions,
  }
  const formData = new FormData()

  // MODIFY
  // file = ensureFileObjectConsistency(file)
  // if (opts.customFilename) {
  //   formData.append(PORTAL_FILE_FIELD_NAME, file, opts.customFilename)
  // } else {
  //   formData.append(PORTAL_FILE_FIELD_NAME, file)
  // }
  if (opts.customFilename) {
    formData.append(PORTAL_FILE_FIELD_NAME, file.data, {
      filename: opts.customFilename,
    })
  } else {
    formData.append(PORTAL_FILE_FIELD_NAME, file.data, {
      filename: file.name,
    })
  }

  const response = await this.executeRequest({
    ...opts,
    endpointPath: opts.endpointUpload,
    method: 'post',
    data: formData,
    headers: formData.getHeaders(),
  })

  return response
}

/* istanbul ignore next */
/**
 * Uploads a large file to Skynet using tus.
 *
 * @param this - SkynetClient
 * @param file - The file to upload.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @param [customOptions.endpointLargeUpload="/skynet/tus"] - The relative URL path of the portal endpoint to contact.
 * @returns - The returned skylink.
 * @throws - Will throw if the request is successful but the upload response does not contain a complete response.
 */
export async function uploadLargeFile(
  this: SkynetClient,
  file: File,
  customOptions?: CustomUploadOptions
): Promise<UploadRequestResponse> {
  // Validation is done in `uploadLargeFileRequest`.

  // MODIFY / DISABLE
  // const response = await this.uploadLargeFileRequest(file, customOptions)

  // // Sanity check.
  // validateLargeUploadResponse(response)

  // // Get the skylink.
  // let skylink = response.headers['skynet-skylink']

  // // Format the skylink.
  // skylink = formatSkylink(skylink)

  const skylink = 'null'
  return { skylink }
}

/* istanbul ignore next */
/**
 * Makes a request to upload a file to Skynet.
 *
 * @param this - SkynetClient
 * @param file - The file to upload.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @param [customOptions.endpointLargeUpload="/skynet/tus"] - The relative URL path of the portal endpoint to contact.
 * @returns - The upload response.
 */
export async function uploadLargeFileRequest(
  this: SkynetClient,
  file: File,
  customOptions?: CustomUploadOptions
): Promise<any> {
  // MODIFY / DISABLE
  // validateFile('file', file, 'parameter')
  // validateOptionalObject(
  //   'customOptions',
  //   customOptions,
  //   'parameter',
  //   defaultUploadOptions
  // )

  // const opts = {
  //   ...defaultUploadOptions,
  //   ...this.customOptions,
  //   ...customOptions,
  // }

  // // TODO: Add back upload options once they are implemented in skyd.
  // const url = await buildRequestUrl(this, opts.endpointLargeUpload)
  // const headers = buildRequestHeaders(
  //   undefined,
  //   opts.customUserAgent,
  //   opts.customCookie
  // )

  // // REMOVE
  // // file = ensureFileObjectConsistency(file)
  // let filename = file.name
  // if (opts.customFilename) {
  //   filename = opts.customFilename
  // }
  // // TODO: Authorization?
  // // TODO: Do we have to enable cross-site cookies?

  // const onProgress =
  //   opts.onUploadProgress &&
  //   function (bytesSent: number, bytesTotal: number) {
  //     const progress = bytesSent / bytesTotal

  //     // @ts-expect-error TS complains.
  //     opts.onUploadProgress(progress, { loaded: bytesSent, total: bytesTotal })
  //   }

  // return new Promise((resolve, reject) => {
  //   const tusOpts = {
  //     endpoint: url,
  //     chunkSize: TUS_CHUNK_SIZE,
  //     retryDelays: opts.retryDelays,
  //     metadata: {
  //       filename,
  //       filetype: file.type,
  //     },
  //     headers,
  //     onProgress,
  //     onError: (error: Error) => {
  //       reject(error)
  //     },
  //     onSuccess: async () => {
  //       if (!upload.url) {
  //         reject(new Error("'upload.url' was not set"))
  //         return
  //       }

  //       // Extract the location from the URL.
  //       const [location] = trimSuffix(upload.url, '/').split('/').slice(-1)
  //       // Call HEAD to get the metadata, including the skylink.
  //       const resp = await this.executeRequest({
  //         ...opts,
  //         endpointPath: opts.endpointLargeUpload,
  //         method: 'head',
  //         headers: { ...headers, 'Tus-Resumable': '1.0.0' },
  //         extraPath: location,
  //       })
  //       resolve(resp)
  //     },
  //   }

  //   const upload = new Upload(file, tusOpts)
  //   upload.start()
  // })
  return new Promise((resolve) => resolve(undefined))
}

/**
 * Uploads a directory to Skynet.
 *
 * @param this - SkynetClient
 * @param directory - File objects to upload, indexed by their path strings.
 * @param filename - The name of the directory.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @param [customOptions.endpointPath="/skynet/skyfile"] - The relative URL path of the portal endpoint to contact.
 * @returns - The returned skylink.
 * @throws - Will throw if the request is successful but the upload response does not contain a complete response.
 */
export async function uploadDirectory(
  this: SkynetClient,
  directory: Record<string, File>,
  filename: string,
  customOptions?: CustomUploadOptions
): Promise<UploadRequestResponse> {
  // Validation is done in `uploadDirectoryRequest`.

  const response = await this.uploadDirectoryRequest(
    directory,
    filename,
    customOptions
  )

  // Sanity check.
  validateUploadResponse(response)

  const skylink = formatSkylink(response.data.skylink)

  return { skylink }
}

/**
 * Makes a request to upload a directory to Skynet.
 *
 * @param this - SkynetClient
 * @param directory - File objects to upload, indexed by their path strings.
 * @param filename - The name of the directory.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @param [customOptions.endpointPath="/skynet/skyfile"] - The relative URL path of the portal endpoint to contact.
 * @returns - The upload response.
 * @throws - Will throw if the input filename is not a string.
 */
export async function uploadDirectoryRequest(
  this: SkynetClient,
  directory: Record<string, File>,
  filename: string,
  customOptions?: CustomUploadOptions
): Promise<any> {
  // MODIFY / DISABLE
  // validateObject('directory', directory, 'parameter')
  // validateString('filename', filename, 'parameter')
  // validateOptionalObject(
  //   'customOptions',
  //   customOptions,
  //   'parameter',
  //   defaultUploadOptions
  // )

  // const opts = {
  //   ...defaultUploadOptions,
  //   ...this.customOptions,
  //   ...customOptions,
  // }

  // const formData = new FormData()
  // Object.entries(directory).forEach(([path, file]) => {
  //   // REMOVE
  //   // file = ensureFileObjectConsistency(file as File)
  //   formData.append(PORTAL_DIRECTORY_FILE_FIELD_NAME, file as File, path)
  // })

  // const response = await this.executeRequest({
  //   ...opts,
  //   endpointPath: opts.endpointUpload,
  //   method: 'post',
  //   data: formData,
  //   query: { filename },
  // })

  // return response
  return new Promise((resolve) => resolve(undefined))
}

// REMOVE
// /**
//  * Sometimes file object might have had the type property defined manually with
//  * Object.defineProperty and some browsers (namely firefox) can have problems
//  * reading it after the file has been appended to form data. To overcome this,
//  * we recreate the file object using native File constructor with a type defined
//  * as a constructor argument.
//  *
//  * @param file - The input file.
//  * @returns - The processed file.
//  */
// function ensureFileObjectConsistency(file: File): File {
//   return new File([file], file.name, { type: getFileMimeType(file) })
// }

// REMOVE
// /**
//  * Validates the given value as a file.
//  *
//  * @param name - The name of the value.
//  * @param value - The actual value.
//  * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
//  * @throws - Will throw if not a valid file.
//  */
// function validateFile(name: string, value: unknown, valueKind: string) {
//   if (!(value instanceof File)) {
//     throwValidationError(name, value, valueKind, "type 'File'")
//   }
// }

/**
 * Validates the upload response.
 *
 * @param response - The upload response.
 * @throws - Will throw if not a valid upload response.
 */
function validateUploadResponse(response: AxiosResponse): void {
  try {
    if (!response.data) {
      throw new Error('response.data field missing')
    }

    validateString('skylink', response.data.skylink, 'upload response field')
  } catch (err) {
    throw new Error(
      `Did not get a complete upload response despite a successful request. Please try again and report this issue to the devs if it persists. ${err}`
    )
  }
}

/* istanbul ignore next */
/**
 * Validates the large upload response.
 *
 * @param response - The upload response.
 * @throws - Will throw if not a valid upload response.
 */
function validateLargeUploadResponse(response: AxiosResponse): void {
  try {
    if (!response.headers) {
      throw new Error('response.headers field missing')
    }

    validateString(
      'response.headers["skynet-skylink"]',
      response.headers['skynet-skylink'],
      'upload response field'
    )
  } catch (err) {
    throw new Error(
      `Did not get a complete upload response despite a successful request. Please try again and report this issue to the devs if it persists. Error: ${err}`
    )
  }
}
