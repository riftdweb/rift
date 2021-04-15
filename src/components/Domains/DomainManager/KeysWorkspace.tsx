import { Box, Flex, Text } from '@modulz/design-system'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { Domain } from '../../../shared/types'
import { KeyEditor } from './KeyEditor'
import { KeysTree } from './KeysTree'
import { DragSizing } from '../../_shared/DragSizing'

type Props = {
  domain: Domain
}

export function KeysWorkspace({ domain }: Props) {
  const { name, keys } = domain
  const { push, query } = useRouter()
  const dataKeyName = query.dataKeyName as string

  useEffect(() => {
    if (!dataKeyName && keys.length) {
      push(
        `/data/${encodeURIComponent(name)}/${encodeURIComponent(keys[0].key)}`
      )
    }
  }, [dataKeyName, keys])

  return (
    <Box>
      <Flex>
        <Box
          css={{
            padding: '12px $2 0 0',
            height: '100vh',
          }}
        >
          <Box
            css={{
              height: '100%',
              borderRadius: '6px',
              backgroundColor: '$gray200',
              transition: 'background-color 0.1s',
              '&:hover': { backgroundColor: '$gray300' },
            }}
          >
            <DragSizing
              border="right"
              handlerOffset={0}
              style={{
                width: '200px',
                height: '100%',
              }}
            >
              <KeysTree domain={domain} keys={keys} />
            </DragSizing>
          </Box>
        </Box>
        <Flex css={{ flex: 1 }}>
          {keys.map((key) => (
            <Box
              key={key.id}
              css={{
                display: key.key === dataKeyName ? 'block' : 'none',
                width: '100%',
                height: '100vh',
              }}
            >
              <KeyEditor domain={domain} dataKey={key} />
            </Box>
          ))}
        </Flex>
      </Flex>
    </Box>
  )
}
