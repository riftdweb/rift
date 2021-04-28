import { Box } from '@riftdweb/design-system'
import React, { useCallback, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Treebeard } from 'react-treebeard'
import { useDomains } from '../../../../hooks/domains'
import { useDomainParams } from '../../../../hooks/useDomainParams'
import animations from './animations'
import { decorators } from './decorators'
import { style } from './style'
import { transformKeys, TreeNode } from './transformKeys'

type Props = {}

export function KeysTree({}: Props) {
  const history = useHistory()
  const { domain, domainKey } = useDomainParams()
  const { domains } = useDomains()

  const activeKeyTreeKey =
    domain && domainKey
      ? `domains/discoverable/${domain.name}/${domainKey.key}`
      : undefined

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
        history.push(
          `/data/${encodeURIComponent(node.domain.name)}/${encodeURIComponent(
            key
          )}`
        )
      }
      nextState[node.id] = nodeState

      setStateMap(nextState)
    },
    [stateMap, setStateMap, history]
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
