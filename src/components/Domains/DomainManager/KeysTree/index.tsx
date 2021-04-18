import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'
import { Treebeard } from 'react-treebeard'
import { style } from './style'
import { decorators } from './decorators'
import animations from './animations'
import { transformKeys, TreeNode } from './transformKeys'
import { Box } from '@modulz/design-system'
import { useDomains } from '../../../../hooks/domains'

type Props = {}

export function KeysTree({}: Props) {
  const { push, query } = useRouter()
  const { domains } = useDomains()

  const activeDomainName = query.domainName as string
  const activeKeyName = query.dataKeyName as string
  const activeKeyTreeKey = `domains/discoverable/${activeDomainName}/${activeKeyName}`

  const [stateMap, setStateMap] = useState({})

  const data = useMemo(() => {
    return transformKeys(domains, stateMap, activeKeyTreeKey)
  }, [domains, stateMap, activeKeyTreeKey])

  const onToggle = useCallback(
    (node: TreeNode, toggled: boolean) => {
      let nextState = {
        ...stateMap,
      }

      const { key, children } = node

      let nodeState = nextState[node.id] || {}
      if (children) {
        nodeState.toggled = toggled
      } else if (node.type === 'file') {
        push(
          `/data/${encodeURIComponent(node.domain.name)}/${encodeURIComponent(
            key
          )}`
        )
      }
      nextState[node.id] = nodeState

      setStateMap(nextState)
    },
    [stateMap, setStateMap, push]
  )

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
