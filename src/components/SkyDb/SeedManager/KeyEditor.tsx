import { Flex } from '@modulz/design-system'
import findIndex from 'lodash/findIndex'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AceEditor from 'react-ace'
import useSWR from 'swr'
import debounce from 'lodash/debounce'
import { useSeeds } from '../../../hooks/useSeeds'
import { useSelectedPortal } from '../../../hooks/useSelectedPortal'
import { getJSON, setJSON } from '../../../shared/skynet'
import { Seed } from '../../../shared/types'
import { KeysToolbar } from './KeysToolbar'

const importConfigFiles = () => {
  return Promise.all([
    // import('ace-builds/src-noconflict/theme-github'),
    import('ace-builds/src-min-noconflict/theme-solarized_dark'),
    import('ace-builds/src-noconflict/mode-json'),
  ])
}

type Props = {
  seed: Seed
  dataKey: string
}

export function KeyEditor({ seed, dataKey }: Props) {
  const { push } = useRouter()
  const { keys } = seed

  const { data: configFilesLoaded } = useSWR(
    'configFilesLoaded',
    importConfigFiles
  )
  const [editingValue, setEditingValue] = useState<string>()
  const [value, setValue] = useState<string>()
  const [skylink, setSkylink] = useState<string>('')
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [selectedPortal] = useSelectedPortal()
  const { removeKey } = useSeeds()
  const { data, isValidating, mutate } = useSWR([seed.id, dataKey], () =>
    getJSON(selectedPortal, seed.id, dataKey)
  )

  const removeKeyAndRoute = useCallback(() => {
    const dataKeyIndex = findIndex(keys, (key) => key === dataKey)
    // load previous
    if (dataKeyIndex > 0) {
      push(`/skydb/${seed.name}/${encodeURIComponent(keys[dataKeyIndex - 1])}`)
    }
    // load previous
    else if (dataKeyIndex === 0 && seed.keys.length > 1) {
      push(`/skydb/${seed.name}/${encodeURIComponent(keys[1])}`)
    }
    removeKey(seed.id, dataKey)
  }, [removeKey, seed, push])

  const setValueFromNetwork = useCallback(
    (data) => {
      if (data && data.data) {
        const newValue = JSON.stringify(data.data, null, 1)
        setValue(newValue)
        setSkylink(data.skylink)

        if (!editingValue) {
          setEditingValue(newValue)
        }
      } else if (data && !data.data) {
        const newValue = '{}'
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
    setEditingValue(value || '{}')
  }, [setEditingValue, value])

  const isDataLatest = useMemo(() => value === editingValue, [
    value,
    editingValue,
  ])

  const isValid = useMemo(() => {
    try {
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

  const debouncedMutate = useMemo(() => {
    return debounce((mutate) => {
      return mutate()
    }, 5000)
  }, [])

  const saveChanges = useCallback(() => {
    formatCode()
    const func = async () => {
      setIsSaving(true)
      try {
        const newData = JSON.parse(editingValue)
        // Update cache immediately
        mutate({ data: newData, skylink }, false)
        // Save changes to SkyDB
        await setJSON(selectedPortal, seed.id, dataKey, newData)
        // Sync latest, will likely be the same
        await debouncedMutate(mutate)
      } finally {
        setIsSaving(false)
      }
    }
    func()
  }, [
    mutate,
    formatCode,
    setIsSaving,
    selectedPortal,
    seed,
    dataKey,
    editingValue,
    skylink,
  ])

  return (
    <Flex css={{ flexDirection: 'column', height: '100%' }}>
      <KeysToolbar
        isDataLatest={isDataLatest}
        skylink={skylink}
        isValidating={isValidating}
        isSaving={isSaving}
        isValid={isValid}
        formatCode={formatCode}
        refreshKey={refreshKey}
        revertChanges={revertChanges}
        removeKey={removeKeyAndRoute}
        saveChanges={saveChanges}
      />
      {configFilesLoaded && (
        <AceEditor
          style={{ width: '100%', flex: 1 }}
          key={dataKey}
          value={editingValue}
          mode="json"
          theme="solarized_dark"
          onChange={(val) => setEditingValue(val)}
          name="UNIQUE_ID_OF_DIV"
          editorProps={{ $blockScrolling: true }}
        />
      )}
    </Flex>
  )
}
