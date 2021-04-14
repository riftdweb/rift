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
  const dataKey = query.dataKey as string

  useEffect(() => {
    if (!dataKey && keys.length) {
      push(
        `/domains/${encodeURIComponent(name)}/${encodeURIComponent(keys[0])}`
      )
    }
  }, [dataKey, keys])

  return (
    <Box>
      <Flex>
        <DragSizing border="right" handlerOffset={0}>
          <Box css={{ padding: '$3 $1' }}>
            <KeysTree domain={domain} keys={keys} />
          </Box>
        </DragSizing>
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
              <KeyEditor domain={domain} dataKey={key} />
            </Box>
          ))}
        </Flex>
      </Flex>
    </Box>
  )
}
