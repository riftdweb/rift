import { getJSON, setJSON } from '../shared/skynet'
import { useState, useCallback, useEffect } from 'react'
import { Button, Input, Flex, Box, Tabs, TabsList, TabsTab, TabsPanel, Text, ControlGroup } from '@modulz/design-system'
import { ReloadIcon } from '@radix-ui/react-icons'
import { useLocalStorage } from '../hooks/useLocalStorage';
import toPairs from 'lodash/toPairs'
import SpinnerIcon from './_icons/SpinnerIcon'
import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';
import useSWR from 'swr'

const keysToMap = (keys) => keys.reduce((acc, key) => ({
  ...acc,
  [key]: null
}), {} as {})

const getKeys = (map) => Object.entries(map).map(([key, value]) => key)

export function SkyDb() {
  const portal = 'siasky.net'
  const seed = 'App 1'
  const [seeds, setSeeds] = useLocalStorage('seedsData', { seeds: [] });
  const [selectedSeed, setSelectedSeed] = useState();
  const { data } = useSWR('true', () => getJSON(portal, selectedSeed, 'all-keys'))
  const keyList = data ? data.data.keys : []
  const [keys, setKeys] = useLocalStorage(`keys-${seed}`, {});
  const [isQueryingKeyMap, setIsQueryingKeyMap] = useState({})

  useEffect(() => {
    const func = async () => {
      if (!data) {
        return
      }

      await setJSON('all-keys', {
        ...keysToMap(data.data.keys),
        keys
      })
    }
    func()
  }, [data])

  useEffect(() => {
    if (!data) {
      return
    }
    const func = async () => {
      let response = await setJSON(portal, seed, 'all-keys', {
        keys: Object.entries(keys).map(([key, value]) => key)
      })
      console.log(response)
      response = await getJSON(portal, seed, 'all-keys')
      console.log(response)
    }
    func()
  }, [data, keys])

  useEffect(() => {
    toPairs(keys).forEach(([key, _value]) => {
      setIsQueryingKeyMap({
        ...isQueryingKeyMap,
        [key]: true
      });
      getJSON(portal, seed, key).then(({ data }) => {
        setIsQueryingKeyMap({
          ...isQueryingKeyMap,
          [key]: false
        });
        setKeys({
          ...keys,
          [key]: data
        })
      })
    })
  }, [])

  const onTextChange = useCallback((keyName, value) => {
    setKeys({
      ...keys,
      [keyName]: value
    })
  }, [setKeys, keys])

  const refreshKey = useCallback((key) => {
    const func = async () => {
      setIsQueryingKeyMap({
        ...isQueryingKeyMap,
        [key]: true
      });
      try {
        const { data } = await getJSON(portal, seed, key)
        setKeys({
          ...keys,
          [key]: data
        })
      } finally {
        setIsQueryingKeyMap({
          ...isQueryingKeyMap,
          [key]: false
        });
      }
    }
    func()
  }, [keys, setKeys])

  const saveKey = useCallback((key) => {
    const func = async () => {
      setIsQueryingKeyMap({
        ...isQueryingKeyMap,
        [key]: true
      });
      try {
        await setJSON(portal, seed, key, keys[key])
      } finally {
        setIsQueryingKeyMap({
          ...isQueryingKeyMap,
          [key]: false
        });
      }
    }
    func()
  }, [keys])

  const [newKey, setNewKey] = useState('')

  const saveNewKey = useCallback(() => {
    setKeys({
      ...keys,
      [newKey]: ''
    })
  }, [newKey, setKeys])

  return (
    <div className="py-6">
      <Tabs defaultValue="tab-one">
        <TabsList>
          <TabsTab value="tab-one">{seed}</TabsTab>
          <TabsTab value="tab-two">SkyFeed</TabsTab>
        </TabsList>
        <TabsPanel value="tab-one">
          <Flex css={{ gap: '$3', flexDirection: 'column', marginTop: '$2' }}>
            <Flex css={{ gap: '$1', alignItems: 'center' }}>
              <Text>Seed</Text>
              <Text>/</Text>
              <Input value={seed} />
            </Flex>
            <Flex css={{ gap: '$1', flexDirection: 'column' }}>
              <Text>Add a data key to view or edit the existing value or create new key value pairs.</Text>
              <Flex css={{ gap: '$1' }}>
                <Input
                  placeholder="Key name"
                  onChange={(e) => setNewKey(e.target.value)} />
                <Button onClick={saveNewKey}>Add Entry</Button>
              </Flex>
            </Flex>
            <Flex css={{ gap: '$2', flexDirection: 'column' }}>
              {toPairs(keys).map(([key, value]) =>
                <Flex
                  key={key}
                  css={{ gap: '$2', position: 'relative' }}>
                  <ControlGroup>
                    <Input
                      value={key}
                      disabled
                      css={{
                        color: '$hiContrast !important',
                      }}
                    />
                    <Button
                      disabled={isQueryingKeyMap[key]}
                      onClick={() => refreshKey(key)}>
                      {isQueryingKeyMap[key] ?
                        <SpinnerIcon />
                        : <ReloadIcon />
                      }
                    </Button>
                    <Button onClick={() => saveKey(key)}>Save</Button>
                  </ControlGroup>
                  <Box css={{ flex: '1' }}>
                    <JSONInput
                      id={'json' + key}
                      waitAfterKeyPress={5000}
                      confirmGood={false}
                      placeholder={value}
                      // colors={darktheme}
                      onChange={(e) => {
                        console.log(e)
                        if (e.jsObject) {
                          onTextChange(key, e.jsObject)
                        }
                      }}
                      locale={locale}
                      height="200px"
                      width="100%"
                    />
                  </Box>
                  {/* <Textarea
                    value={value}
                    onChange={(e) => onTextChange(key, e)} /> */}
                </Flex>
              )}
            </Flex>
          </Flex>
        </TabsPanel>
        <TabsPanel value="tab-two">
          <Text>Panel 2</Text>
        </TabsPanel>
      </Tabs>
    </div>
  )
}

  // const debouncedKey = useDebounce(keys, 1000)

  // useEffect(
  //   () => {
  //     if (debouncedKey) {
  //       setIsQueryingKey(true);
  //       getJSON(debouncedKey).then(({ data }) => {
  //         setIsQueryingKey(false)
  //         setKeys({
  //           ...keys,
  //           [key]: data ? data.text : "")
  //       })
  //     } else {
  //       setText("")
  //     }
  //   },
  //   [setText, debouncedKey]
  // )
