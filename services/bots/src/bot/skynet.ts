import {
  deriveDiscoverableTweak,
  validateObject,
  validateOptionalObject,
  validateString,
  defaultGetJSONOptions,
  defaultSetJSONOptions,
  CustomGetJSONOptions,
  CustomSetJSONOptions,
  getOrCreateRegistryEntry,
  JsonData,
  JSONResponse,
  defaultSetEntryOptions,
  RegistryEntry,
  signEntry,
  genKeyPairFromSeed,
  Signature,
  SkynetClient,
  hexToUint8Array,
  extractOptions,
} from '@riftdweb/skynet-js-iso';

const client = new SkynetClient('https://siasky.net');

/**
 * Gets Discoverable JSON at the given path through MySky, if the user has given permissions to do so.
 *
 * @param path - The data path.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An object containing the json data as well as the skylink for the data.
 */
export async function getJSON(
  seed: string,
  path: string,
  customOptions?: CustomGetJSONOptions
): Promise<JSONResponse> {
  validateString('path', path, 'parameter');
  validateOptionalObject(
    'customOptions',
    customOptions,
    'parameter',
    defaultGetJSONOptions
  );

  const { publicKey } = genKeyPairFromSeed(seed);

  const opts = {
    ...defaultGetJSONOptions,
    // ...this.connector.client.customOptions,
    ...customOptions,
  };

  // const publicKey = await this.userID();
  const dataKey = deriveDiscoverableTweak(path);
  opts.hashedDataKeyHex = true; // Do not hash the tweak anymore.

  return await client.db.getJSON(publicKey, dataKey, opts);
}

/**
 * Sets Discoverable JSON at the given path through MySky, if the user has given permissions to do so.
 *
 * @param path - The data path.
 * @param json - The json to set.
 * @param [customOptions] - Additional settings that can optionally be set.
 * @returns - An object containing the json data as well as the skylink for the data.
 */
export async function setJSON(
  seed: string,
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

  const { publicKey, privateKey } = genKeyPairFromSeed(seed);

  const opts = {
    ...defaultSetJSONOptions,
    // ...this.connector.client.customOptions,
    ...customOptions,
  };

  // const publicKey = await this.userID();
  const dataKey = deriveDiscoverableTweak(path);
  opts.hashedDataKeyHex = true; // Do not hash the tweak anymore.

  const [entry, skylink] = await getOrCreateRegistryEntry(
    client,
    hexToUint8Array(publicKey),
    dataKey,
    json,
    opts
  );

  const signature = await signRegistryEntry(privateKey, entry);

  const setEntryOpts = extractOptions(opts, defaultSetEntryOptions);
  await client.registry.postSignedEntry(
    publicKey,
    entry,
    signature,
    setEntryOpts
  );

  return { data: json, skylink };
}

async function signRegistryEntry(
  privateKey: string,
  entry: RegistryEntry
): Promise<Signature> {
  // return await this.connector.connection.remoteHandle().call("signRegistryEntry", entry, path);
  const signature = await signEntry(privateKey, entry, true);
  return signature as Signature;
}
