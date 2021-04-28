import {
  Box,
  Button,
  ControlGroup,
  Heading,
  Input,
  Tooltip,
} from '@riftdweb/design-system'
import { ClipboardIcon, ExternalLinkIcon } from '@radix-ui/react-icons'
import { useCallback, useState } from 'react'
import { convertSkylinkToBase32 } from 'skynet-js/dist/utils/skylink'
import { useSelectedPortal } from '../../hooks/useSelectedPortal'
import { copyToClipboard } from '../../shared/clipboard'

export function Formatter() {
  const [selectedPortal] = useSelectedPortal()
  const [skylink, setSkylink] = useState<string>('')
  const [base32Value, setBase32Value] = useState<string>('')

  const onChange = useCallback(
    (e) => {
      const value = e.target.value.replace('sia://', '')
      if (!value) {
        setSkylink('')
        setBase32Value('')
      } else {
        setSkylink(value)
        setBase32Value(convertSkylinkToBase32(value))
      }
    },
    [setSkylink, setBase32Value]
  )

  const subdomainSkylink = skylink && `https://${base32Value}.${selectedPortal}`
  const pathSkylink = skylink && `https://${selectedPortal}/${skylink}`

  return (
    <Box>
      <Box css={{ margin: '$3 0 $3' }}>
        <Heading>Skylink Formatter</Heading>
      </Box>
      <Input
        css={{ marginBottom: '$2' }}
        placeholder="Enter Skylink, eg: sia://AAC__QplPuwUqC2kW7OTWw1Pg4Be-jw70MQrpyIcehba3g"
        onChange={onChange}
      />
      <ControlGroup css={{ margin: '$1 0' }}>
        <Button css={{ width: '150px' }}>Subdomain link</Button>
        <Input
          disabled
          placeholder={`https://<base32>.${selectedPortal}`}
          css={{ color: '$hiContrast !important' }}
          value={subdomainSkylink}
        />
        <Tooltip content="Open skylink">
          <Button as="a" href={subdomainSkylink} target="_blank">
            <ExternalLinkIcon />
          </Button>
        </Tooltip>
        <Tooltip content="Copy to clipboard">
          <Button
            onClick={() =>
              copyToClipboard(subdomainSkylink, 'subdomain skylink')
            }
          >
            <ClipboardIcon />
          </Button>
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
        <Tooltip content="Open skylink">
          <Button as="a" href={pathSkylink} target="_blank">
            <ExternalLinkIcon />
          </Button>
        </Tooltip>
        <Tooltip content="Copy to clipboard">
          <Button onClick={() => copyToClipboard(pathSkylink, 'path skylink')}>
            <ClipboardIcon />
          </Button>
        </Tooltip>
      </ControlGroup>
    </Box>
  )
}
