import { Box, Button, ControlGroup, Input, Subheading, Tooltip } from '@modulz/design-system';
import { ClipboardCopyIcon, ExternalLinkIcon } from '@radix-ui/react-icons';
import * as clipboard from 'clipboard-polyfill/text';
import { useCallback, useState } from 'react';
import { useSelectedPortal } from '../../hooks/useSelectedPortal';
import { decodeBase64, encodeBase32 } from '../../shared/base';

export function Formatter() {
  const [selectedPortal] = useSelectedPortal()
  const [skylink, setSkylink] = useState<string>()
  const [base32Value, setBase32Value] = useState<string>()

  const onChange = useCallback((e) => {
    const value = e.target.value.replace('sia://', '')
    const decoded = decodeBase64(value)
    const encoded = encodeBase32(decoded)

    setSkylink(value)
    setBase32Value(encoded)
  }, [setSkylink, setBase32Value])

  const subdomainSkylink = skylink && `https://${base32Value}.${selectedPortal}`
  const pathSkylink = skylink && `https://${selectedPortal}/${skylink}`

  return (
    <Box>
      <Box css={{ margin: '50px 0 $3' }}>
        <Subheading>Skylink Formatter</Subheading>
      </Box>
      <Input
        css={{ marginBottom: '$2' }}
        placeholder='Enter Skylink, eg: sia://AAC__QplPuwUqC2kW7OTWw1Pg4Be-jw70MQrpyIcehba3g'
        onChange={onChange} />
      <ControlGroup css={{ margin: '$1 0' }}>
        <Button css={{ width: '150px' }}>Subdomain link</Button>
        <Input
          disabled
          placeholder={`https://<base32>.${selectedPortal}`}
          css={{ color: '$hiContrast !important' }}
          value={subdomainSkylink}
        />
        <Tooltip content='Open skylink'>
          <Button as='a' href={subdomainSkylink} target='_blank'><ExternalLinkIcon /></Button>
        </Tooltip>
        <Tooltip content='Copy to clipboard'>
          <Button onClick={() => clipboard.writeText(subdomainSkylink)}><ClipboardCopyIcon /></Button>
        </Tooltip>
      </ControlGroup>
      <ControlGroup css={{ margin: '$1 0' }}>
        <Button css={{ width: '150px' }}>Path link</Button>
        <Input
          disabled
          placeholder={`https://${selectedPortal}/<skylink>`}
          css={{ color: '$hiContrast !important' }}
          value={pathSkylink}
        />
        <Tooltip content='Open skylink'>
          <Button as='a' href={pathSkylink} target='_blank'><ExternalLinkIcon /></Button>
        </Tooltip>
        <Tooltip content='Copy to clipboard'>
          <Button onClick={() => clipboard.writeText(pathSkylink)}><ClipboardCopyIcon /></Button>
        </Tooltip>
      </ControlGroup>
    </Box>
  )
}
