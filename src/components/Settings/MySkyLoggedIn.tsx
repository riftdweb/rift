import {
  Box,
  Button,
  Code,
  Flex,
  Heading,
  Paragraph,
  Text,
  Tooltip,
} from '@modulz/design-system'
import { ClipboardIcon, DownloadIcon } from '@radix-ui/react-icons'
import React, { useCallback } from 'react'
import { useDomains } from '../../hooks/domains'
import { useSkynet } from '../../hooks/skynet'
import { copyToClipboard } from '../../shared/clipboard'
import { useApps } from '../../hooks/useApps'
import { useSkyfiles } from '../../hooks/useSkyfiles'
import { exportData } from './_shared/exportData'
import {
  APPS_DATA_KEY,
  SKYDB_DATA_KEY,
  SKYFILES_DATA_KEY,
} from '../../shared/dataKeys'
import { useHistory } from 'react-router-dom'

export function MySkyLoggedIn() {
  const { userId, logout, dataDomain: appDomain } = useSkynet()
  const history = useHistory()
  const { domains, addDomain } = useDomains()
  const { skyfiles } = useSkyfiles()
  const { apps } = useApps()

  const addToSkyDBTool = useCallback(() => {
    addDomain({
      name: appDomain,
      dataDomain: appDomain,
      addedAt: new Date().toISOString(),
      keys: [APPS_DATA_KEY, SKYFILES_DATA_KEY, SKYDB_DATA_KEY].map((key) => ({
        id: key,
        key,
      })),
    })
    history.push('/data')
  }, [addDomain, appDomain, history])

  const exportAllData = useCallback(() => {
    exportData(skyfiles, domains, apps)
  }, [domains, skyfiles, apps])

  return (
    <Box css={{ margin: '$3 0' }}>
      <Flex css={{ flexDirection: 'column', gap: '$2' }}>
        <Heading>MySky</Heading>
        <Paragraph css={{ color: '$gray900' }}>
          Currently logged in as user: <Code>{userId.slice(0, 10)}...</Code>
        </Paragraph>
        <Text>
          {apps.length
            ? `${apps.length} ${apps.length > 1 ? 'Apps' : 'App'}`
            : '0 Apps'}
        </Text>
        <Text>
          {skyfiles.length
            ? `${skyfiles.length} ${skyfiles.length > 1 ? 'Files' : 'File'}`
            : '0 Files'}
        </Text>
        <Text>
          {domains.length
            ? `${domains.length} ${domains.length > 1 ? 'Domains' : 'Domain'}`
            : '0 Domains'}
        </Text>
        <Flex css={{ gap: '$1', alignItems: 'center', marginTop: '$2' }}>
          <Tooltip content="Copy local seed to clipboard">
            <Button onClick={() => copyToClipboard(userId, 'user ID')}>
              <Box css={{ mr: '$1' }}>
                <ClipboardIcon />
              </Box>
              Copy user ID to clipboard
            </Button>
          </Tooltip>
          <Tooltip content="Show MySky data in the Data tool">
            <Button onClick={() => addToSkyDBTool()}>
              Add MySky metadata to Data
            </Button>
          </Tooltip>
          <Tooltip content="Export all MySky user data">
            <Button onClick={exportAllData}>
              <Box css={{ mr: '$1' }}>
                <DownloadIcon />
              </Box>
              Export all metadata
            </Button>
          </Tooltip>
          <Box css={{ flex: 1 }} />
          <Tooltip content="Log out of MySky">
            <Button variant="red" onClick={() => logout()}>
              Log out
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
    </Box>
  )
}
