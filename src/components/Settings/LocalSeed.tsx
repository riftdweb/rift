import {
  Box,
  Button,
  Flex,
  Heading,
  Paragraph,
  Text,
  Tooltip,
} from '@modulz/design-system'
import { ClipboardIcon, DownloadIcon } from '@radix-ui/react-icons'
import React, { useCallback } from 'react'
import { useLocalRootSeed } from '../../hooks/useLocalRootSeed'
import { useDomains } from '../../hooks/domains'
import { useSkynet } from '../../hooks/skynet'
import { copyToClipboard } from '../../shared/clipboard'
import { App, Domain, Skyfile } from '../../shared/types'
import useSWR from 'swr'
import {
  APPS_DATA_KEY,
  SKYDB_DATA_KEY,
  SKYFILES_DATA_KEY,
} from '../../shared/dataKeys'
import { exportData } from './_shared/exportData'

export function LocalSeed() {
  const { Api, userId } = useSkynet()
  const { localRootSeed, regenerate } = useLocalRootSeed()
  const { addDomain } = useDomains()

  // Fetch because if the app is logged into MySky the contexts do not contain local seed data
  const { data: skyDbData } = useSWR<{ data: Domain[] }>(
    [localRootSeed, SKYDB_DATA_KEY],
    () =>
      (Api.getJSON({
        seed: localRootSeed,
        dataKey: SKYDB_DATA_KEY,
      }) as unknown) as Promise<{
        data: Domain[]
      }>
  )
  // Fetch because if the app is logged into MySky the contexts do not contain local seed data
  const { data: skyfilesData } = useSWR<{ data: Skyfile[] }>(
    [localRootSeed, SKYFILES_DATA_KEY],
    () =>
      (Api.getJSON({
        seed: localRootSeed,
        dataKey: SKYFILES_DATA_KEY,
      }) as unknown) as Promise<{
        data: Skyfile[]
      }>
  )
  // Fetch because if the app is logged into MySky the contexts do not contain local seed data
  const { data: appsData } = useSWR<{ data: App[] }>(
    [localRootSeed, APPS_DATA_KEY],
    () =>
      (Api.getJSON({
        seed: localRootSeed,
        dataKey: APPS_DATA_KEY,
      }) as unknown) as Promise<{
        data: App[]
      }>
  )

  const exportAllData = useCallback(() => {
    exportData(skyfilesData.data, skyDbData.data, appsData.data)
  }, [skyDbData, skyfilesData, appsData])

  const addLocalRootSeedToDomainsTool = useCallback(() => {
    // Disabled if logged in to MySKy
    if (userId) {
      return
    }

    addDomain({
      name: 'Rift',
      parentSeed: localRootSeed,
      childSeed: '',
      addedAt: new Date().toISOString(),
      keys: [APPS_DATA_KEY, SKYFILES_DATA_KEY, SKYDB_DATA_KEY].map((key) => ({
        id: key,
        key,
      })),
    })
  }, [addDomain, localRootSeed])

  return (
    <Box css={{ margin: '$3 0' }}>
      <Flex css={{ flexDirection: 'column', gap: '$2' }}>
        <Heading>Local seed</Heading>
        <Paragraph css={{ color: '$gray900' }}>
          Using Rift without a MySky indentity saves App data to a locally
          cached seed.{' '}
          {userId && 'Log out of MySky to switch back to this data.'}
        </Paragraph>
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
          <Tooltip content="Show local seed and data keys in the Data tool">
            <Button
              disabled={!!userId}
              onClick={() => addLocalRootSeedToDomainsTool()}
            >
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
          <Box css={{ flex: 1 }} />
          <Tooltip content="Regenerating Rift seed will clear all data">
            <Button
              variant="red"
              disabled={!!userId}
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
