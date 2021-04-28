import { ClipboardIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  ControlGroup,
  Heading,
  Input,
  Tooltip,
} from '@riftdweb/design-system'
import { useCallback, useState } from 'react'
import sia from 'sia-js'
import { copyToClipboard } from '../../shared/clipboard'

function mnemonicToBytes(mnemonic: string) {
  const mnemonicBytes = sia.mnemonics.mnemonicToBytes(mnemonic)
  if (mnemonicBytes.length != 32) {
    console.log('Wrong mnemonic length:', mnemonicBytes.length)
  }
  return mnemonicBytes
}

function toHexString(byteArray) {
  let s = ''
  byteArray.forEach((byte) => {
    s += ('0' + (byte & 0xff).toString(16)).slice(-2)
  })
  return s
}

export function MnemonicToHex() {
  const [hexValue, setHexValue] = useState<string>('')

  const onChange = useCallback(
    (e) => {
      const mnemonic = e.target.value
      if (mnemonic) {
        const mnemonicBytes = mnemonicToBytes(mnemonic)
        const hexString = toHexString(mnemonicBytes)
        setHexValue(hexString)
      }
    },
    [setHexValue]
  )

  return (
    <Box>
      <Box css={{ margin: '$3 0 $3' }}>
        <Heading>Mnemonic to Hex Converter</Heading>
      </Box>
      <Input
        css={{ marginBottom: '$2' }}
        placeholder="Enter mnemonic"
        onChange={onChange}
      />
      <ControlGroup css={{ margin: '$1 0' }}>
        <Button css={{ width: '150px' }}>Hex</Button>
        <Input
          disabled
          placeholder="Hex"
          css={{ color: '$hiContrast !important' }}
          value={hexValue}
        />
        <Tooltip content="Copy to clipboard">
          <Button onClick={() => copyToClipboard(hexValue, 'hex')}>
            <ClipboardIcon />
          </Button>
        </Tooltip>
      </ControlGroup>
    </Box>
  )
}
