/* istanbul ignore file */

export { SkynetClient } from './client'
export {
  deriveChildSeed,
  genKeyPairAndSeed,
  genKeyPairFromSeed,
} from './crypto'
export { getSkylinkUrlForPortal } from './download'
// MODIFY
export {
  getEntryUrlForPortal,
  signEntry,
  defaultSetEntryOptions,
} from './registry'
export { DacLibrary, mySkyDomain, mySkyDevDomain } from './mysky'
// ADD
export { deriveDiscoverableTweak } from './mysky/tweak'
export {
  convertSkylinkToBase32,
  convertSkylinkToBase64,
} from './skylink/format'
export { parseSkylink } from './skylink/parse'
export { isSkylinkV1, isSkylinkV2 } from './skylink/sia'
export { getRelativeFilePath, getRootDirectory } from './utils/file'
export { MAX_REVISION } from './utils/number'
// MODIFY
export {
  stringToUint8ArrayUtf8,
  uint8ArrayToStringUtf8,
  hexToUint8Array,
} from './utils/string'
export {
  defaultPortalUrl,
  defaultSkynetPortalUrl,
  extractDomainForPortal,
  getFullDomainUrlForPortal,
  uriHandshakePrefix,
  uriSkynetPrefix,
} from './utils/url'
// ADD
export {
  validateObject,
  validateOptionalObject,
  validateString,
} from './utils/validation'
// ADD
export { extractOptions } from './utils/options'
// Re-export Permission API.
export {
  Permission,
  PermCategory,
  PermType,
  PermRead,
  PermWrite,
  PermHidden,
  PermDiscoverable,
  PermLegacySkyID,
} from 'skynet-mysky-utils'

// Export types.

export type { CustomClientOptions, RequestConfig } from './client'
export type { KeyPair, KeyPairAndSeed, Signature } from './crypto'
export type { CustomDownloadOptions, ResolveHnsResponse } from './download'
export type { CustomConnectorOptions, MySky } from './mysky'
export type {
  CustomGetEntryOptions,
  CustomSetEntryOptions,
  SignedRegistryEntry,
  RegistryEntry,
} from './registry'
export type {
  CustomGetJSONOptions,
  CustomSetJSONOptions,
  JsonData,
  JSONResponse,
} from './skydb'
// ADD
export { defaultSetJSONOptions, getOrCreateRegistryEntry } from './skydb'
export type { CustomUploadOptions, UploadRequestResponse } from './upload'
export type { ParseSkylinkOptions } from './skylink/parse'
