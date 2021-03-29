import base64 from 'base64-js'
import base32Encode from 'base32-encode'

export function decodeBase64(input = '') {
  return base64.toByteArray(
    input.padEnd(input.length + 4 - (input.length % 4), '=')
  )
}

export function encodeBase32(input: Uint8Array) {
  return base32Encode(input, 'RFC4648-HEX', { padding: false }).toLowerCase()
}
