import { Box, Button, Heading, Input, Textarea } from '@modulz/design-system'
import { useSkynet } from '../../hooks/skynet'
// import { ContentRecordDAC } from '@skynethq/content-record-library'
import { useCallback, useEffect, useState } from 'react'
import { JsonData } from 'skynet-js'

// const contentRecord = new ContentRecordDAC()

const dataDomain = 'localhost'

export function MySkyLearn() {
  const { Api, loggedIn, userId, logout, login } = useSkynet()

  const [dataKey, setDataKey] = useState('')
  const [data, setData] = useState<JsonData>()
  const [filePath, setFilePath] = useState<string>()

  useEffect(() => {
    setFilePath(dataDomain + '/' + dataKey)
  }, [dataKey])

  const saveFilePath = useCallback(() => {
    const func = async () => {
      const { data } = await Api.getJSON({
        dataKey: filePath,
      })
      setData(data)
    }
    func()
  }, [Api, setData])

  const save = useCallback(() => {
    const func = async () => {
      await Api.setJSON({
        dataKey,
        json: data,
      })
    }
    func()
  }, [Api, setData])

  return (
    <Box>
      <Box css={{ margin: '$3 0 $3' }}>
        <Heading>Learning</Heading>
        {loggedIn ? (
          <Button onClick={logout}>Logout</Button>
        ) : (
          <Button onClick={login}>Login</Button>
        )}
        <Button>{userId}</Button>
        <Box css={{ p: '$2 0' }}>
          <Input onChange={(e) => setFilePath(e.target.value)} />
          <Button onClick={saveFilePath}>Save file path</Button>
        </Box>
        <Box css={{ p: '$2 0' }}>
          <Textarea
            onChange={(e) =>
              setData({
                data: e.target.value,
              })
            }
          />
          <Button onClick={save}>Save</Button>
        </Box>
      </Box>
    </Box>
  )
}
