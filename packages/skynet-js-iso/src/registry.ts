import type { AxiosError, AxiosResponse } from 'axios'
import { Buffer } from 'buffer'
import { sign } from 'tweetnacl'

import { SkynetClient } from './client'
import { assertUint64 } from './utils/number'
import { BaseCustomOptions, defaultBaseOptions } from './utils/options'
import {
  ensurePrefix,
  hexToUint8Array,
  isHexString,
  toHexString,
  trimPrefix,
} from './utils/string'
import { addUrlQuery, makeUrl } from './utils/url'
import { hashDataKey, hashRegistryEntry, Signature } from './crypto'
import {
  throwValidationError,
  validateBigint,
  validateHexString,
  validateObject,
  validateOptionalObject,
  validateString,
  validateUint8Array,
} from './utils/validation'
import { newEd25519PublicKey, newSkylinkV2 } from './skylink/sia'
import { formatSkylink } from './skylink/format'

/**
 * Custom get entry options.
 *
 * @property [endpointGetEntry] - The relative URL path of the portal endpoint to contact.
 * @property [hashedDataKeyHex] - Whether the data key is already hashed and in hex format. If not, we hash the data key.
 */
export type CustomGetEntryOptions = BaseCustomOptions & {
  endpointGetEntry?: string
  hashedDataKeyHex?: boolean
}

/**
 * Custom set entry options.
 *
 * @property [endpointSetEntry] - The relative URL path of the portal endpoint to contact.
 * @property [hashedDataKeyHex] - Whether the data key is already hashed and in hex format. If not, we hash the data key.
 */
export type CustomSetEntryOptions = BaseCustomOptions & {
  endpointSetEntry?: string
  hashedDataKeyHex?: boolean
}

export const defaultGetEntryOptions = {
  ...defaultBaseOptions,
  endpointGetEntry: '/skynet/registry',
  hashedDataKeyHex: false,
}

export const defaultSetEntryOptions = {
  ...defaultBaseOptions,
  endpointSetEntry: '/skynet/registry',
  hashedDataKeyHex: false,
}

export const DEFAULT_GET_ENTRY_TIMEOUT = 5 // 5 seconds

/**
 * Regex for JSON revision value without quotes.
 */
export const regexRevisionNoQuotes = /"revision":\s*([0-9]+)/

/**
 * Regex for JSON revision value with quotes.
 */
const regexRevisionWithQuotes = /"revision":\s*"([0-9]+)"/

const ED25519_PREFIX = 'ed25519:'

/**
 * Registry entry.
 *
 * @property dataKey - The key of the data for the given entry.
 * @property data - The data stored in the entry.
 * @property revision - The revision number for the entry.
 */
export type RegistryEntry = {
  dataKey: string
  data: Uint8Array
  revision: bigint
}

/**
 * Signed registry entry.
 *
 * @property entry - The registry entry.
 * @property signature - The signature of the registry entry.
 */
export type SignedRegistryEntry = {
  entry: RegistryEntry | null
  signature: Signature | null
}

/**
 * Gets the registry entry corresponding to the publicKey and dataKey.
 *
 * @param this - SkynetClient
 * @param publicKey - The user public key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The signed registry entry.
 * @throws - Will throw if the returned signature does not match the returned entry or the provided timeout is invalid or the given key is not valid.
 */
export async function getEntry(
  this: SkynetClient,
  publicKey: string,
  dataKey: string,
  customOptions?: CustomGetEntryOptions
): Promise<SignedRegistryEntry> {
  // Validation is done in `getEntryUrl`.

  const opts = {
    ...defaultGetEntryOptions,
    ...this.customOptions,
    ...customOptions,
  }

  const url = await this.registry.getEntryUrl(publicKey, dataKey, opts)

  let response: AxiosResponse
  try {
    response = await this.executeRequest({
      ...opts,
      endpointPath: opts.endpointGetEntry,
      url,
      method: 'get',
      // Transform the response to add quotes, since uint64 cannot be accurately
      // read by JS so the revision needs to be parsed as a string.
      transformResponse: function (data: string) {
        if (data === undefined) {
          return {}
        }
        // Change the revision value from a JSON integer to a string.
        data = data.replace(regexRevisionNoQuotes, '"revision":"$1"')
        // Try converting the JSON data to an object.
        try {
          return JSON.parse(data)
        } catch {
          // The data is not JSON, it's likely an HTML error response.
          return data
        }
      },
    })
  } catch (err) {
    return handleGetEntryErrResponse(err)
  }

  // Sanity check.
  try {
    validateString(
      'response.data.data',
      response.data.data,
      'entry response field'
    )
    validateString(
      'response.data.revision',
      response.data.revision,
      'entry response field'
    )
    validateString(
      'response.data.signature',
      response.data.signature,
      'entry response field'
    )
  } catch (err) {
    throw new Error(
      `Did not get a complete entry response despite a successful request. Please try again and report this issue to the devs if it persists. Error: ${err}`
    )
  }

  // Convert the revision from a string to bigint.
  const revision = BigInt(response.data.revision)
  const signature = Buffer.from(hexToUint8Array(response.data.signature))
  // Use empty array if the data is empty.
  let data = new Uint8Array([])
  if (response.data.data) {
    data = hexToUint8Array(response.data.data)
  }
  const signedEntry = {
    entry: {
      dataKey,
      data,
      revision,
    },
    signature,
  }

  // Try verifying the returned data.
  if (
    sign.detached.verify(
      hashRegistryEntry(signedEntry.entry, opts.hashedDataKeyHex),
      new Uint8Array(signedEntry.signature),
      hexToUint8Array(publicKey)
    )
  ) {
    return signedEntry
  }

  // The response could not be verified.
  throw new Error(
    'could not verify signature from retrieved, signed registry entry -- possible corrupted entry'
  )
}

/**
 * Gets the registry entry URL corresponding to the publicKey and dataKey.
 *
 * @param this - SkynetClient
 * @param publicKey - The user public key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The full get entry URL.
 * @throws - Will throw if the provided timeout is invalid or the given key is not valid.
 */
export async function getEntryUrl(
  this: SkynetClient,
  publicKey: string,
  dataKey: string,
  customOptions?: CustomGetEntryOptions
): Promise<string> {
  // Validation is done in `getEntryUrlForPortal`.

  const opts = {
    ...defaultGetEntryOptions,
    ...this.customOptions,
    ...customOptions,
  }

  const portalUrl = await this.portalUrl()

  return getEntryUrlForPortal(portalUrl, publicKey, dataKey, opts)
}

/**
 * Gets the registry entry URL without an initialized client.
 *
 * @param portalUrl - The portal URL.
 * @param publicKey - The user public key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The full get entry URL.
 * @throws - Will throw if the given key is not valid.
 */
export function getEntryUrlForPortal(
  portalUrl: string,
  publicKey: string,
  dataKey: string,
  customOptions?: CustomGetEntryOptions
): string {
  validateString('portalUrl', portalUrl, 'parameter')
  validatePublicKey('publicKey', publicKey, 'parameter')
  validateString('dataKey', dataKey, 'parameter')
  validateOptionalObject(
    'customOptions',
    customOptions,
    'parameter',
    defaultGetEntryOptions
  )

  const opts = {
    ...defaultGetEntryOptions,
    ...customOptions,
  }

  // Hash and hex encode the given data key if it is not a hash already.
  let dataKeyHashHex = dataKey
  if (!opts.hashedDataKeyHex) {
    dataKeyHashHex = toHexString(hashDataKey(dataKey))
  }

  const query = {
    publickey: ensurePrefix(publicKey, ED25519_PREFIX),
    datakey: dataKeyHashHex,
    timeout: DEFAULT_GET_ENTRY_TIMEOUT,
  }

  let url = makeUrl(portalUrl, opts.endpointGetEntry)
  url = addUrlQuery(url, query)

  return url
}

/**
 * Gets the entry link for the entry at the given public key and data key. This link stays the same even if the content at the entry changes.
 *
 * @param this - SkynetClient
 * @param publicKey - The user public key.
 * @param dataKey - The key of the data to fetch for the given user.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - The entry link.
 * @throws - Will throw if the given key is not valid.
 */
export async function getEntryLink(
  this: SkynetClient,
  publicKey: string,
  dataKey: string,
  customOptions?: CustomGetEntryOptions
): Promise<string> {
  validatePublicKey('publicKey', publicKey, 'parameter')
  validateString('dataKey', dataKey, 'parameter')
  validateOptionalObject(
    'customOptions',
    customOptions,
    'parameter',
    defaultGetEntryOptions
  )

  const opts = {
    ...defaultGetEntryOptions,
    ...customOptions,
  }

  const siaPublicKey = newEd25519PublicKey(
    trimPrefix(publicKey, ED25519_PREFIX)
  )
  let tweak
  if (opts.hashedDataKeyHex) {
    tweak = hexToUint8Array(dataKey)
  } else {
    tweak = hashDataKey(dataKey)
  }

  const skylink = newSkylinkV2(siaPublicKey, tweak).toString()
  return formatSkylink(skylink)
}

/**
 * Sets the registry entry.
 *
 * @param this - SkynetClient
 * @param privateKey - The user private key.
 * @param entry - The entry to set.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An empty promise.
 * @throws - Will throw if the entry revision does not fit in 64 bits or the given key is not valid.
 */
export async function setEntry(
  this: SkynetClient,
  privateKey: string,
  entry: RegistryEntry,
  customOptions?: CustomSetEntryOptions
): Promise<void> {
  validateHexString('privateKey', privateKey, 'parameter')
  validateRegistryEntry('entry', entry, 'parameter')
  validateOptionalObject(
    'customOptions',
    customOptions,
    'parameter',
    defaultSetEntryOptions
  )

  // Assert the input is 64 bits.
  assertUint64(entry.revision)

  const opts = {
    ...defaultSetEntryOptions,
    ...this.customOptions,
    ...customOptions,
  }

  const privateKeyArray = hexToUint8Array(privateKey)
  const signature: Uint8Array = await signEntry(
    privateKey,
    entry,
    opts.hashedDataKeyHex
  )
  const { publicKey: publicKeyArray } = sign.keyPair.fromSecretKey(
    privateKeyArray
  )

  return await this.registry.postSignedEntry(
    toHexString(publicKeyArray),
    entry,
    signature,
    opts
  )
}

/**
 * Signs the entry with the given private key.
 *
 * @param privateKey - The user private key.
 * @param entry - The entry to sign.
 * @param hashedDataKeyHex - Whether the data key is already hashed and in hex format. If not, we hash the data key.
 * @returns - The signature.
 */
export async function signEntry(
  privateKey: string,
  entry: RegistryEntry,
  hashedDataKeyHex: boolean
): Promise<Uint8Array> {
  // TODO: Publicly available, validate input.

  const privateKeyArray = hexToUint8Array(privateKey)

  // Sign the entry.
  // TODO: signature type should be Signature?
  return sign(hashRegistryEntry(entry, hashedDataKeyHex), privateKeyArray)
}

/**
 * Posts the entry with the given public key and signature to Skynet.
 *
 * @param this - The Skynet client.
 * @param publicKey - The user public key.
 * @param entry - The entry to set.
 * @param signature - The signature.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An empty promise.
 */
export async function postSignedEntry(
  this: SkynetClient,
  publicKey: string,
  entry: RegistryEntry,
  signature: Uint8Array,
  customOptions?: CustomSetEntryOptions
): Promise<void> {
  validateHexString('publicKey', publicKey, 'parameter')
  validateRegistryEntry('entry', entry, 'parameter')
  validateUint8Array('signature', signature, 'parameter')
  validateOptionalObject(
    'customOptions',
    customOptions,
    'parameter',
    defaultSetEntryOptions
  )

  const opts = {
    ...defaultSetEntryOptions,
    ...this.customOptions,
    ...customOptions,
  }

  // Hash and hex encode the given data key if it is not a hash already.
  let datakey = entry.dataKey
  if (!opts.hashedDataKeyHex) {
    datakey = toHexString(hashDataKey(datakey))
  }
  // Convert the entry data to an array from raw bytes.
  const entryData = Array.from(entry.data)
  const data = {
    publickey: {
      algorithm: 'ed25519',
      key: Array.from(hexToUint8Array(publicKey)),
    },
    datakey,
    // Set the revision as a string here. The value may be up to 64 bits and the limit for a JS number is 53 bits.
    // We remove the quotes later in transformRequest, as JSON does support 64 bit numbers.
    revision: entry.revision.toString(),
    data: entryData,
    signature: Array.from(signature),
  }

  await this.executeRequest({
    ...opts,
    endpointPath: opts.endpointSetEntry,
    method: 'post',
    data,
    // Transform the request to remove quotes, since the revision needs to be
    // parsed as a uint64 on the Go side.
    transformRequest: function (data: unknown) {
      // Convert the object data to JSON.
      const json = JSON.stringify(data)
      // Change the revision value from a string to a JSON integer.
      return json.replace(regexRevisionWithQuotes, '"revision":$1')
    },
  })
}

/**
 * Handles error responses returned in getEntry.
 *
 * @param err - The Axios error.
 * @returns - An empty signed registry entry if the status code is 404.
 * @throws - Will throw if the status code is not 404.
 */
function handleGetEntryErrResponse(err: AxiosError): SignedRegistryEntry {
  /* istanbul ignore next */
  if (!err.response) {
    throw new Error(
      `Error response field not found, incomplete Axios error. Full error: ${err}`
    )
  }
  /* istanbul ignore next */
  if (!err.response.status) {
    throw new Error(
      `Error response did not contain expected field 'status'. Full error: ${err}`
    )
  }
  // Check if status was 404 "not found" and return null if so.
  if (err.response.status === 404) {
    return { entry: null, signature: null }
  }

  throw err
}

/**
 * Validates the given registry entry.
 *
 * @param name - The name of the value.
 * @param value - The actual value.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 */
export function validateRegistryEntry(
  name: string,
  value: unknown,
  valueKind: string
): void {
  validateObject(name, value, valueKind)
  validateString(
    `${name}.dataKey`,
    (value as RegistryEntry).dataKey,
    `${valueKind} field`
  )
  validateUint8Array(
    `${name}.data`,
    (value as RegistryEntry).data,
    `${valueKind} field`
  )
  validateBigint(
    `${name}.revision`,
    (value as RegistryEntry).revision,
    `${valueKind} field`
  )
}

/**
 * Validates the given value as a hex-encoded, potentially prefixed public key.
 *
 * @param name - The name of the value.
 * @param publicKey - The public key.
 * @param valueKind - The kind of value that is being checked (e.g. "parameter", "response field", etc.)
 * @throws - Will throw if not a valid hex-encoded public key.
 */
function validatePublicKey(
  name: string,
  publicKey: string,
  valueKind: string
): void {
  if (!isHexString(trimPrefix(publicKey, ED25519_PREFIX))) {
    throwValidationError(
      name,
      publicKey,
      valueKind,
      'a hex-encoded string with a valid prefix'
    )
  }
}
