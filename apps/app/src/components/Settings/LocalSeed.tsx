import { ClipboardIcon, DownloadIcon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Flex,
  Heading,
  Paragraph,
  Text,
  Tooltip,
} from '@riftdweb/design-system'
import { App, Domain, Skyfile } from '@riftdweb/types'
import { Fragment, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import useSWR from 'swr'
import { useDomains } from '@riftdweb/core/src/contexts/domains'
import { useSkynet } from '@riftdweb/core/src/contexts/skynet'
import { useLocalRootSeed } from '@riftdweb/core/src/hooks/useLocalRootSeed'
import { copyToClipboard } from '@riftdweb/core/src/shared/clipboard'
import { DATA_PRIVATE_FEATURES } from '@riftdweb/core/src/shared/config'
import {
  dataKeysExportList,
  getDataKeyDomains,
  getDataKeyApps,
  getDataKeyFiles,
} from '@riftdweb/core/src/shared/dataKeys'
import { exportData } from './_shared/exportData'

const dataKeyDomains = getDataKeyDomains()
const dataKeyApps = getDataKeyApps()
const dataKeyFiles = getDataKeyFiles()

export function LocalSeed() {
  const { Api, myUserId } = useSkynet()
  const { localRootSeed, regenerate } = useLocalRootSeed()
  const { addDomain } = useDomains()
  const history = useHistory()

  // Fetch because if the app is logged into MySky the contexts do not contain local seed data
  const { data: skyDbData } = useSWR([localRootSeed, dataKeyDomains], () =>
    Api.getJSON<Domain[]>({
      seed: localRootSeed,
      path: dataKeyDomains,
      priority: 4,
    })
  )
  // Fetch because if the app is logged into MySky the contexts do not contain local seed data
  const { data: skyfilesData } = useSWR([localRootSeed, dataKeyFiles], () =>
    Api.getJSON<Skyfile[]>({
      seed: localRootSeed,
      path: dataKeyFiles,
      priority: 4,
    })
  )
  // Fetch because if the app is logged into MySky the contexts do not contain local seed data
  const { data: appsData } = useSWR([localRootSeed, dataKeyApps], () =>
    Api.getJSON<App[]>({
      seed: localRootSeed,
      path: dataKeyApps,
      priority: 4,
    })
  )

  const exportAllData = useCallback(() => {
    exportData(skyfilesData.data, skyDbData.data, appsData.data)
  }, [skyDbData, skyfilesData, appsData])

  const addLocalRootSeedToDomainsTool = useCallback(() => {
    // Disabled if logged in to MySKy
    // if (userId) {
    //   return
    // }

    addDomain({
      name: 'Rift',
      parentSeed: localRootSeed,
      childSeed: '',
      addedAt: new Date().toISOString(),
      keys: dataKeysExportList.map((key) => ({
        id: key,
        key,
      })),
    })
    history.push('/data')
  }, [addDomain, localRootSeed, history])

  return (
    <Box css={{ marginTop: '$9' }}>
      <Flex css={{ flexDirection: 'column', gap: '$2' }}>
        <Heading
          css={{
            borderBottom: '1px solid $gray300',
            paddingBottom: '$2',
            marginBottom: '$2',
          }}
        >
          Local seed
        </Heading>
        <Paragraph css={{ color: '$gray900', fontSize: '$3' }}>
          Using Rift without a MySky indentity saves App data to a locally
          cached seed.{' '}
          {myUserId && 'Log out of MySky to switch back to this data.'}
        </Paragraph>
        {DATA_PRIVATE_FEATURES && (
          <Fragment>
            <Text>
              {appsData?.data?.length
                ? `${appsData.data.length} App${
                    appsData.data.length > 1 ? 's' : ''
                  }`
                : '0 Apps'}
            </Text>
            <Text>
              {skyfilesData?.data?.length
                ? `${skyfilesData.data.length} ${
                    skyfilesData.data.length > 1 ? 'Files' : 'File'
                  }`
                : '0 Files'}
            </Text>
            <Text>
              {skyDbData?.data?.length
                ? `${skyDbData.data.length} ${
                    skyDbData.data.length > 1 ? 'Domains' : 'Domain'
                  }`
                : '0 Domains'}
            </Text>
          </Fragment>
        )}
        <Flex css={{ gap: '$1', alignItems: 'center', marginTop: '$2' }}>
          <Tooltip content="Copy local seed to clipboard">
            <Button
              onClick={() => copyToClipboard(localRootSeed, 'local root seed')}
            >
              <Box css={{ mr: '$1' }}>
                <ClipboardIcon />
              </Box>
              Copy seed to clipboard
            </Button>
          </Tooltip>
          {DATA_PRIVATE_FEATURES && (
            <Fragment>
              <Tooltip content="Show local seed and data keys in the Data tool">
                <Button onClick={() => addLocalRootSeedToDomainsTool()}>
                  Add local metadata to Data
                </Button>
              </Tooltip>
              <Tooltip content="Export all local user data">
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
          <Tooltip content="Regenerating Rift seed will clear all data">
            <Button
              variant="red"
              disabled={!!myUserId}
              onClick={() => regenerate()}
            >
              Regenerate
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
    </Box>
  )
}
