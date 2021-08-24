import { Box, Flex } from '@riftdweb/design-system'
import { Domain, DomainKey } from '@riftdweb/types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import AceEditor from 'react-ace'
import useSWR from 'swr'
import { useDomains } from '../../../contexts/domains'
import { useSkynet } from '../../../contexts/skynet'
import { useDomainParams } from '../../../hooks/useDomainParams'
import { triggerToast } from '../../../shared/toast'
import { KeysToolbar } from './KeysToolbar'

const importConfigFiles = () => {
  return Promise.all([
    // import('ace-builds/src-noconflict/theme-github'),
    import('ace-builds/src-min-noconflict/theme-solarized_dark'),
    import('ace-builds/src-noconflict/mode-json'),
  ])
}

type Props = {
  domain: Domain
  dataKey: DomainKey
}

export function KeyEditor({ domain, dataKey }: Props) {
  const { data: configFilesLoaded } = useSWR(
    'configFilesLoaded',
    importConfigFiles
  )
  const [editingValue, setEditingValue] = useState<string>()
  const [value, setValue] = useState<string>()
  const [skylink, setSkylink] = useState<string>('')
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const { Api, identityKey, myUserId } = useSkynet()
  const { removeKey } = useDomains()
  const { viewingUserId, isReadOnly } = useDomainParams()
  const key = [
    myUserId === viewingUserId ? identityKey : viewingUserId,
    domain.id,
    dataKey.id,
  ]
  const keyString = key.join('/')
  const { data, isValidating, mutate } = useSWR(key, () => {
    // Only one of the two will be defined
    const { seed, dataDomain } = domain
    return Api.getJSON<{}>({
      seed,
      domain: dataDomain,
      publicKey: viewingUserId,
      path: dataKey.key,
      discoverable: true,
      priority: 4,
    })
  })

  const removeKeyAndRoute = useCallback(() => {
    removeKey(domain.id, dataKey.id, true)
  }, [removeKey, domain, dataKey])

  const setValueFromNetwork = useCallback(
    (data) => {
      if (data && data.data) {
        const newValue = JSON.stringify(data.data, null, 1)
        setValue(newValue)
        setSkylink(data.dataLink || '')

        // Set editing value,
        // or if no edits have been made by user, sync what is displayed to latest
        if (!editingValue || editingValue === value) {
          setEditingValue(newValue)
        }
      } else if (data && !data.data) {
        const newValue = undefined
        setValue(newValue)
        setSkylink('')

        if (!editingValue) {
          setEditingValue(newValue)
        }
      }
    },
    [setValue, setSkylink, editingValue, setEditingValue, value]
  )

  // Reset all state when data key changes
  useEffect(() => {
    setValue(undefined)
    setEditingValue(undefined)
    setSkylink('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyString])

  // Initialize state after data is first fetched
  useEffect(() => {
    setValueFromNetwork(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const refreshKey = useCallback(() => {
    mutate()
  }, [mutate])

  const revertChanges = useCallback(() => {
    setEditingValue(value)
  }, [setEditingValue, value])

  const isDataLatest = useMemo(() => value === editingValue, [
    value,
    editingValue,
  ])

  const isValid = useMemo(() => {
    try {
      if (!editingValue) {
        return true
      }
      JSON.parse(editingValue)
      return true
    } catch (e) {
      return false
    }
  }, [editingValue])

  const formatCode = useCallback(() => {
    try {
      const jsonValue = JSON.parse(editingValue)
      const formatValue = JSON.stringify(jsonValue, null, 1)
      setEditingValue(formatValue)
    } catch (e) {}
  }, [editingValue, setEditingValue])

  const saveChanges = useCallback(() => {
    formatCode()
    const func = async () => {
      setIsSaving(true)
      try {
        const newData = JSON.parse(editingValue)
        // Update cache immediately
        mutate({ data: newData, dataLink: skylink }, false)
        // Save changes to SkyDB

        // Only one of the two will be defined
        const { seed, dataDomain } = domain
        try {
          await Api.setJSON({
            seed,
            domain: dataDomain,
            path: dataKey.key,
            json: newData,
            discoverable: true,
            priority: 4,
          })
        } catch (e) {
          const customMessage =
            e.message === 'Permission was not granted'
              ? 'Permission to edit this content has not been granted'
              : e.message

          triggerToast(customMessage, 'error')
        }

        // Sync latest, will likely be the same
        await mutate()
      } finally {
        setIsSaving(false)
      }
    }
    func()
  }, [
    Api,
    mutate,
    formatCode,
    setIsSaving,
    domain,
    dataKey,
    editingValue,
    skylink,
  ])

  return (
    <Flex css={{ flexDirection: 'column', height: '100%', width: '100%' }}>
      <KeysToolbar
        isDataLatest={isDataLatest}
        skylink={skylink}
        isValidating={isValidating}
        isSaving={isSaving}
        isValid={isValid}
        isReadOnly={isReadOnly}
        isEmpty={!editingValue}
        formatCode={formatCode}
        refreshKey={refreshKey}
        revertChanges={revertChanges}
        removeKey={removeKeyAndRoute}
        saveChanges={saveChanges}
      />
      {configFilesLoaded && (
        <Box css={{ borderRadius: '6px', overflow: 'hidden', flex: 1 }}>
          <AceEditor
            style={{ width: '100%', height: '100%' }}
            readOnly={isReadOnly}
            key={keyString}
            value={editingValue || ''}
            mode="json"
            theme="solarized_dark"
            onChange={(val) => setEditingValue(val)}
            name="UNIQUE_ID_OF_DIV"
            editorProps={{ $blockScrolling: true }}
          />
        </Box>
      )}
    </Flex>
  )
}
