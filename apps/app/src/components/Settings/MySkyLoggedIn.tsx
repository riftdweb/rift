import { ClipboardIcon, DownloadIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Tooltip,
} from '@riftdweb/design-system'
import { Fragment, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { useDomains } from '../../contexts/domains'
import { DATA_MYSKY_BASE_PATH } from '../../hooks/path'
import { useSkynet } from '../../contexts/skynet'
import { useApps } from '../../contexts/apps'
import { useSkyfiles } from '../../contexts/skyfiles'
import { copyToClipboard } from '../../shared/clipboard'
import { DATA_PRIVATE_FEATURES } from '../../shared/config'
import { dataKeysExportList } from '../../shared/dataKeys'
import { User } from '../_shared/User'
import { exportData } from './_shared/exportData'

export function MySkyLoggedIn() {
  const { myUserId, myProfile, logout, appDomain } = useSkynet()
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
          <User userId={myUserId} profile={myProfile} />
        </Flex>
        {DATA_PRIVATE_FEATURES && (
          <Fragment>
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
                ? `${domains.length} ${
                    domains.length > 1 ? 'Domains' : 'Domain'
                  }`
                : '0 Domains'}
            </Text>
          </Fragment>
        )}
        <Flex css={{ gap: '$1', alignItems: 'center', marginTop: '$2' }}>
          <Tooltip content="Copy user ID to clipboard">
            <Button onClick={() => copyToClipboard(myUserId, 'user ID')}>
              <Box css={{ mr: '$1' }}>
                <ClipboardIcon />
              </Box>
              Copy user ID to clipboard
            </Button>
          </Tooltip>
          {DATA_PRIVATE_FEATURES && (
            <Fragment>
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
            </Fragment>
          )}
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
