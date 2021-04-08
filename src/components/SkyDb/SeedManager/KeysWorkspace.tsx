import {
  Box,
  Tabs,
  TabsList,
  Flex,
  TabsPanel,
  TabsTab,
  Text,
} from '@modulz/design-system'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { Seed } from '../../../shared/types'
import { KeyEditor } from './KeyEditor'

type Props = {
  seed: Seed
}

export function KeysWorkspace({ seed }: Props) {
  const { name, keys } = seed
  const { push, query } = useRouter()
  const dataKey = query.dataKey as string

  useEffect(() => {
    if (!dataKey && keys.length) {
      push(`/skydb/${name}/${encodeURIComponent(keys[0])}`)
    }
  }, [dataKey, keys])

  return (
    <Box>
      <Flex>
        <Flex
          defaultValue={keys.length ? keys[0] : undefined}
          css={{
            flexDirection: 'column',
            width: '150px',
            margin: '$2 $2 $2 0',
          }}
        >
          {keys.map((key) => (
            <Text
              onClick={() => push(`/skydb/${name}/${encodeURIComponent(key)}`)}
              css={{
                overflow: 'hidden',
                borderRadius: '$2',
                padding: '$2 $3',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: dataKey === key ? '$hiContrast' : '$gray900',
                backgroundColor: dataKey === key ? '$gray500' : 'inherit',
                cursor: 'pointer',
                '&:hover': {
                  color: '$hiContrast',
                },
              }}
            >
              {key}
            </Text>
          ))}
        </Flex>
        <Flex css={{ flex: 1 }}>
          {keys.map((key) => (
            <Box
              key={key}
              css={{
                display: key === dataKey ? 'block' : 'none',
                width: '100%',
                height: '100vh',
              }}
            >
              <KeyEditor seed={seed} dataKey={key} />
            </Box>
          ))}
        </Flex>
      </Flex>
    </Box>
  )
}
