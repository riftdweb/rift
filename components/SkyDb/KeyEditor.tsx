import { getJSON, setJSON } from '../../shared/skynet'
import { useState, useCallback, useEffect } from 'react'
import { Box } from '@modulz/design-system'
import useSWR from 'swr'
import { useSelectedPortal } from '../../hooks/useSelectedPortal';
import AceEditor from "react-ace";
import { KeysToolbar } from './KeysToolbar';
import { useSeedKeys } from '../../hooks/useSeedKeys';

import "ace-builds/src-noconflict/mode-json"
// import "ace-builds/src-noconflict/theme-github"
import "ace-builds/src-min-noconflict/theme-solarized_dark"

export function KeyEditor({ seed, dataKey }) {
  const [value, setValue] = useState<string>()
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [selectedPortal] = useSelectedPortal()
  const [_keys, _setKey, removeKey] = useSeedKeys(seed)
  const { data } = useSWR(dataKey, () => getJSON(selectedPortal, seed, dataKey))

  console.log(dataKey, data)

  const setValueFromNetwork = useCallback((data) => {
    if (data && data.data) {
      setValue(JSON.stringify(data.data, null, 1))
    }
  }, [setValue])

  // Initialize state after data is first fetched
  useEffect(() => {
    setValueFromNetwork(data)
  }, [data])

  const saveChanges = useCallback(() => {
    setJSON(selectedPortal, seed, dataKey, JSON.parse(value))
  }, [selectedPortal, seed, dataKey, value])

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

  return (
    <Box>
      <KeysToolbar
        isFetching={isFetching}
        refreshKey={refreshKey}
        removeKey={() => removeKey(dataKey)}
        saveChanges={saveChanges} />
      <AceEditor
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
