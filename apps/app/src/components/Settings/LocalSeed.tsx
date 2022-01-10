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
import {
  useDomains,
  useSkynet,
  useLocalRootSeed,
  copyToClipboard,
  DATA_PRIVATE_FEATURES,
  dataKeysExportList,
  getDataKeyDomains,
  getDataKeyApps,
  getDataKeyFiles,
} from '@riftdweb/core'

const dataKeyDomains = getDataKeyDomains()
const dataKeyApps = getDataKeyApps()
const dataKeyFiles = getDataKeyFiles()

export function LocalSeed() {
  const { Api, myUserId } = useSkynet()
  const { localRootSeed, regenerate } = useLocalRootSeed()
  const { addDomain } = useDomains()
  const history = useHistory()

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
            borderBottom: '1px solid $gray4',
            paddingBottom: '$2',
            marginBottom: '$2',
          }}
        >
          Local seed
        </Heading>
        <Paragraph css={{ color: '$gray11', fontSize: '$3' }}>
          Using Rift without a MySky indentity saves App data to a locally
          cached seed.{' '}
          {myUserId && 'Log out of MySky to switch back to this data.'}
        </Paragraph>
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
