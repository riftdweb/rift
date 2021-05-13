import { Box } from '@riftdweb/design-system'
import { useCallback, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Treebeard } from 'react-treebeard'
import { useDomains } from '../../../../hooks/domains'
import { DATA_MYSKY_BASE_PATH, usePath } from '../../../../hooks/path'
import { useDomainParams } from '../../../../hooks/useDomainParams'
import animations from './animations'
import { decorators } from './decorators'
import { style } from './style'
import { transformKeys, TreeNode } from './transformKeys'

export function KeysTree() {
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

  const { getDataPath } = usePath()

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
        const path = getDataPath({
          domainName: node.domain.name,
          dataKeyName: key,
        })

        if (path === DATA_MYSKY_BASE_PATH) {
          alert('To view this file, first select a MySky user')
        }
        history.push(path)
      }
      nextState[node.id] = nodeState

      setStateMap(nextState)
    },
    [getDataPath, stateMap, setStateMap, history]
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
