import { SkynetClient, genKeyPairFromSeed } from "skynet-js";

export function getJSON(portal: string, seed: string, dataKey: string) {
  const client = new SkynetClient(`https://${portal}`);
  const { publicKey } = genKeyPairFromSeed(seed);
  try {
    return client.db.getJSON(publicKey, dataKey, { timeout: 20 });
  } catch (error) {
    console.log(error);
  }
}

export function setJSON(portal: string, seed: string, dataKey: string, json: {}) {
  const client = new SkynetClient(`https://${portal}`);
  const { privateKey } = genKeyPairFromSeed(seed);
  try {
    return client.db.setJSON(privateKey, dataKey, json, undefined, { timeout: 20 });
  } catch (error) {
    console.log(error);
  }
}

export async function downloadFile(portal: string, skylink: string) {
  const client = new SkynetClient(`https://${portal}`);
  try {
    const response = await client.downloadFile(skylink);
    console.log(response);
    // Or client.openFile(skylink) to open it in a new browser tab.
  } catch (error) {
    console.log(error);
  }
}
