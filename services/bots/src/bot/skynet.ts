import {
  deriveDiscoverableTweak,
  validateObject,
  validateOptionalObject,
  validateString,
  // defaultGetJSONOptions,
  defaultSetJSONOptions,
  // CustomGetJSONOptions,
  CustomSetJSONOptions,
  getOrCreateRegistryEntry,
  JsonData,
  JSONResponse,
  defaultSetEntryOptions,
  RegistryEntry,
  signEntry,
  Signature,
  SkynetClient,
  extractOptions,
} from '@riftdweb/skynet-js-iso';
import { phraseToSeed } from './mysky';
import { genKeyPairFromSeed } from './mysky/utils';

const client = new SkynetClient('https://siasky.net');

/**
 * Sets Discoverable JSON at the given path through MySky, if the user has given Write permissions to do so.
 *
 * @param path - The data path.
 * @param json - The json to set.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An object containing the json data as well as the skylink for the data.
 */
export async function setJSON(
  // ADD
  phrase: string,
  path: string,
  json: JsonData,
  customOptions?: CustomSetJSONOptions
): Promise<JSONResponse> {
  validateString('path', path, 'parameter');
  validateObject('json', json, 'parameter');
  validateOptionalObject(
    'customOptions',
    customOptions,
    'parameter',
    defaultSetJSONOptions
  );

  const seed = phraseToSeed(phrase);
  // genKeyPairFromSeed is NOT from skynet-js
  const { publicKey, privateKey } = genKeyPairFromSeed(seed);

  const opts = {
    ...defaultSetJSONOptions,
    // REMOVE
    // ...this.connector.client.customOptions,
    ...customOptions,
  };

  // REMOVE
  // const publicKey = await this.userID();
  const dataKey = deriveDiscoverableTweak(path);
  opts.hashedDataKeyHex = true; // Do not hash the tweak anymore.

  // MODIFIED getOrCreateRegistryEntry implementation
  const [entry, dataLink] = await getOrCreateRegistryEntry(
    // MODIFY
    // this.connector.client,
    client,
    publicKey,
    dataKey,
    json,
    opts
  );

  // MODIFY
  // const signature = await this.signRegistryEntry(entry, path);
  const signature = await signRegistryEntry(privateKey, entry);

  const setEntryOpts = extractOptions(opts, defaultSetEntryOptions);
  // MODIFY
  // await this.connector.client.registry.postSignedEntry(
  await client.registry.postSignedEntry(
    publicKey,
    entry,
    signature,
    setEntryOpts
  );

  return { data: json, dataLink };
}

async function signRegistryEntry(
  // ADD
  privateKey: string,
  entry: RegistryEntry
  // REMOVE
  // path: string,
): Promise<Signature> {
  // MODIFY
  // return await this.connector.connection.remoteHandle().call("signRegistryEntry", entry, path);
  const signature = await signEntry(privateKey, entry, true);
  return signature as Signature;
}
