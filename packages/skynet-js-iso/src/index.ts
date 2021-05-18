export { SkynetClient } from './client'
export {
  deriveChildSeed,
  genKeyPairAndSeed,
  genKeyPairFromSeed,
} from './crypto'
// export { signEntry } from "./registry";
export { getRelativeFilePath, getRootDirectory } from './utils/file'
export { MAX_REVISION } from './utils/number'
export {
  parseSkylink,
  uriHandshakePrefix,
  uriHandshakeResolverPrefix,
  uriSkynetPrefix,
} from './utils/skylink'
export {
  defaultPortalUrl,
  defaultSkynetPortalUrl,
  extractDomainForPortal,
  getFullDomainUrlForPortal,
  getEntryUrlForPortal,
  getSkylinkUrlForPortal,
} from './utils/url'
export { DacLibrary, mySkyDomain, mySkyDevDomain } from './mysky'
// Re-export Permissions.
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
export type { Signature } from './crypto'
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
export type { CustomUploadOptions, UploadRequestResponse } from './upload'
export type { ParseSkylinkOptions } from './utils/skylink'

export { deriveDiscoverableTweak } from './mysky/tweak'
export {
  validateObject,
  validateOptionalObject,
  validateString,
} from './utils/validation'
export {
  defaultGetJSONOptions,
  defaultSetJSONOptions,
  getOrCreateRegistryEntry,
} from './skydb'
export { defaultSetEntryOptions, signEntry } from './registry'
export { hexToUint8Array } from './utils/string'
export { extractOptions } from './utils/options'
