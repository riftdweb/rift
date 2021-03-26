import { getJSON, setJSON } from '../../shared/skynet'
import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { Box } from '@modulz/design-system'
import useSWR from 'swr'
import findIndex from 'lodash/findIndex'
import { useSelectedPortal } from '../../hooks/useSelectedPortal';
import AceEditor from "react-ace";
import { useRouter } from 'next/router';
import { KeysToolbar } from './KeysToolbar';
import { useSeedKeys } from '../../hooks/useSeedKeys';

import "ace-builds/src-noconflict/mode-json"
// import "ace-builds/src-noconflict/theme-github"
import "ace-builds/src-min-noconflict/theme-solarized_dark"

export function KeyEditor({ seed, dataKey }) {
  const { push } = useRouter()
  const [lastNetworkValue, setLastNetworkValue] = useState<string>()
  const [value, setValue] = useState<string>()
  const [revision, setRevision] = useState<number>(0)
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [selectedPortal] = useSelectedPortal()
  const [keys, _setKey, removeKey] = useSeedKeys(seed)
  const { data } = useSWR(dataKey, () => getJSON(selectedPortal, seed, dataKey))

  const removeKeyAndRoute = useCallback(() => {
    const dataKeyIndex = findIndex(keys, key => key === dataKey)
    // load previous
    if (dataKeyIndex > 0) {
      push(`/skydb/${seed}/${keys[dataKeyIndex - 1]}`)
    }
    // load previous
    else if (dataKeyIndex === 0 && keys.length > 1) {
      push(`/skydb/${seed}/${keys[1]}`)
    }
    removeKey(dataKey)
  }, [removeKey, keys, push])

  const setValueFromNetwork = useCallback((data) => {
    if (data && data.data) {
      const newValue = JSON.stringify(data.data, null, 1)
      setLastNetworkValue(newValue)
      setValue(newValue)
      setRevision(Number(data.revision))
    }
  }, [setValue, setRevision])

  // Initialize state after data is first fetched
  useEffect(() => {
    setValueFromNetwork(data)
  }, [data])

  const saveChanges = useCallback(() => {
    const func = async () => {
      setIsFetching(true)
      try {
        await setJSON(selectedPortal, seed, dataKey, JSON.parse(value))
        const { data } = await getJSON(selectedPortal, seed, dataKey)
        setValueFromNetwork(data)
      } finally {
        setIsFetching(false)
      }
    }
    func()
  }, [setIsFetching, setValueFromNetwork, selectedPortal, seed, dataKey, value, setRevision])

  const refreshKey = useCallback(() => {
    const func = async () => {
      setIsFetching(true)
      try {
        const { data } = await getJSON(selectedPortal, seed, dataKey)
        setValueFromNetwork(data)
      } finally {
        setIsFetching(false)
      }
    }
    func()
  }, [setIsFetching, setValueFromNetwork, selectedPortal, seed, dataKey])

  const isDataLatest = useMemo(() => value === lastNetworkValue, [value, lastNetworkValue])

  const isValid = useMemo(() => {
    try {
      const jsonValue = JSON.parse(value)
      const formatValue = JSON.stringify(jsonValue, null, 1)
      return true
    } catch (e) {
      return false
    }
  }, [value])

  const formatCode = useCallback(() => {
    try {
      const jsonValue = JSON.parse(value)
      const formatValue = JSON.stringify(jsonValue, null, 1)
      setValue(formatValue)
    } catch (e) {
    }
  }, [value, setValue])

  const ref = useRef()

  return (
    <Box>
      <KeysToolbar
        isDataLatest={isDataLatest}
        revision={revision}
        isFetching={isFetching}
        isValid={isValid}
        formatCode={formatCode}
        refreshKey={refreshKey}
        removeKey={removeKeyAndRoute}
        saveChanges={saveChanges} />
      <AceEditor
        ref={ref}
        style={{ width: '100%' }}
        key={dataKey}
        value={value}
        mode="json"
        theme="solarized_dark"
        onChange={(value) => setValue(value)}
        name="UNIQUE_ID_OF_DIV"
        editorProps={{ $blockScrolling: true }}
      />
    </Box>
  )
}
