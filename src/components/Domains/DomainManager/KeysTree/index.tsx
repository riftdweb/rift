import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'
import { Treebeard } from 'react-treebeard'
import { style } from './style'
import { decorators } from './decorators'
import { Domain, DomainKey } from '../../../../shared/types'
import animations from './animations'
import { transformKeys, TreeNode } from './transformKeys'
import { Box } from '@modulz/design-system'

type Props = {
  domain: Domain
  keys: DomainKey[]
}

export function KeysTree({ domain, keys }: Props) {
  const { push, query } = useRouter()
  const activeKeyName = query.dataKeyName as string
  const activeKeyTreeKey = `domains/discoverable/${domain.name}/${activeKeyName}`
  const [stateMap, setStateMap] = useState({})

  const data = useMemo(() => {
    return transformKeys(domain, keys, stateMap, activeKeyTreeKey)
  }, [domain, keys, stateMap, activeKeyTreeKey])

  const onToggle = useCallback(
    (node: TreeNode, toggled: boolean) => {
      let nextState = {
        ...stateMap,
      }

      const { key, children } = node

      let nodeState = nextState[node.id] || {}
      if (children) {
        nodeState.toggled = toggled
      } else {
        push(
          `/data/${encodeURIComponent(domain.name)}/${encodeURIComponent(key)}`
        )
      }
      nextState[node.id] = nodeState

      setStateMap(nextState)
    },
    [stateMap, setStateMap, push]
  )

  console.log(data)

  return (
    <Box
      css={{
        padding: '$1 $2',
      }}
    >
      <Treebeard
        data={data}
        onToggle={onToggle}
        decorators={decorators}
        animations={animations}
        style={style}
      />
    </Box>
  )
}
