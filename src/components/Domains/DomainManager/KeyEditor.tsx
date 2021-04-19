import { Box, Flex } from '@modulz/design-system'
import findIndex from 'lodash/findIndex'
import { useHistory } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AceEditor from 'react-ace'
import useSWR from 'swr'
import { useDomains } from '../../../hooks/domains'
import { useSelectedPortal } from '../../../hooks/useSelectedPortal'
import { Domain, DomainKey } from '../../../shared/types'
import { KeysToolbar } from './KeysToolbar'
import { useSkynet } from '../../../hooks/skynet'

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
  const history = useHistory()
  const { keys } = domain

  const { data: configFilesLoaded } = useSWR(
    'configFilesLoaded',
    importConfigFiles
  )
  const [editingValue, setEditingValue] = useState<string>()
  const [value, setValue] = useState<string>()
  const [skylink, setSkylink] = useState<string>('')
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [selectedPortal] = useSelectedPortal()
  const { Api, identityKey } = useSkynet()
  const { removeKey } = useDomains()
  const key = [identityKey, domain.id, dataKey.id]
  const { data, isValidating, mutate } = useSWR(key, () => {
    // Only one of the two will be defined
    const { seed, dataDomain } = domain
    return Api.getJSON({
      seed,
      dataDomain,
      dataKey: dataKey.key,
    })
  })

  const removeKeyAndRoute = useCallback(() => {
    const dataKeyIndex = findIndex(keys, (key) => key.id === dataKey.id)
    // load previous
    if (dataKeyIndex > 0) {
      history.push(
        `/data/${encodeURIComponent(domain.name)}/${encodeURIComponent(
          keys[dataKeyIndex - 1].key
        )}`
      )
    }
    // load previous
    else if (dataKeyIndex === 0 && domain.keys.length > 1) {
      history.push(
        `/data/${encodeURIComponent(domain.name)}/${encodeURIComponent(
          keys[1].key
        )}`
      )
    }
    removeKey(domain.id, dataKey.id)
  }, [removeKey, domain, history])

  const setValueFromNetwork = useCallback(
    (data) => {
      if (data && data.data) {
        const newValue = JSON.stringify(data.data, null, 1)
        setValue(newValue)
        setSkylink(data.skylink || '')

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
    [setValue, setSkylink, editingValue, setEditingValue, skylink]
  )

  // Initialize state after data is first fetched
  useEffect(() => {
    setValueFromNetwork(data)
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
        mutate({ data: newData, skylink }, false)
        // Save changes to SkyDB

        // Only one of the two will be defined
        const { seed, dataDomain } = domain
        await Api.setJSON({
          seed,
          dataDomain,
          dataKey: dataKey.key,
          json: newData,
        })

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
    selectedPortal,
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
            key={dataKey.id}
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
