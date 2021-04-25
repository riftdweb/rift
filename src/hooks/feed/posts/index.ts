import { Post } from '../types'

export async function getPosts(Api): Promise<Post[]> {
  // Fetch content record data from bot public key
  const botPublicKey =
    '7811b31ded60d43db16d28fa7805d018d93c2ea846040c80a16b87c6d3d5c132'
  const response = await Api.getJSON({
    publicKey: botPublicKey,
    dataDomain: 'crqa.hns',
    dataKey: `${botPublicKey}/newcontent/page_0.json`,
  })
  return response.data.entries.map((entry) => entry.metadata)
}
