import { ClipboardIcon, DownloadIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Tooltip,
} from '@riftdweb/design-system'
import { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { useDomains } from '../../hooks/domains'
import { DATA_MYSKY_BASE_PATH } from '../../hooks/path'
import { useSkynet } from '../../hooks/skynet'
import { useApps } from '../../hooks/useApps'
import { useSkyfiles } from '../../hooks/useSkyfiles'
import { copyToClipboard } from '../../shared/clipboard'
import { dataKeysExportList } from '../../shared/dataKeys'
import { User } from '../Social/_shared/User'
import { exportData } from './_shared/exportData'

export function MySkyLoggedIn() {
  const { userId, myProfile, logout, dataDomain: appDomain } = useSkynet()
  const history = useHistory()
  const { domains, addDomain } = useDomains()
  const { skyfiles } = useSkyfiles()
  const { apps } = useApps()

  const addToSkyDBTool = useCallback(() => {
    addDomain({
      name: appDomain,
      dataDomain: appDomain,
      addedAt: new Date().toISOString(),
      keys: dataKeysExportList.map((key) => ({
        id: key,
        key,
      })),
    })
    history.push(DATA_MYSKY_BASE_PATH)
  }, [addDomain, appDomain, history])

  const exportAllData = useCallback(() => {
    exportData(skyfiles, domains, apps)
  }, [domains, skyfiles, apps])

  return (
    <Box css={{ margin: '$3 0' }}>
      <Flex css={{ flexDirection: 'column', gap: '$2' }}>
        <Heading
          css={{
            borderBottom: '1px solid $gray300',
            paddingBottom: '$2',
            marginBottom: '$2',
          }}
        >
          MySky
        </Heading>
        <Flex css={{ alignItems: 'center', gap: '$2' }}>
          <Text css={{ color: '$gray900' }}>Currently logged in as</Text>
          <User userId={userId} profile={myProfile} />
        </Flex>
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
          <Tooltip content="Copy user ID to clipboard">
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
