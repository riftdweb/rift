import { Box } from '@modulz/design-system'
import { ClipboardIcon } from '@radix-ui/react-icons'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Treebeard } from 'react-treebeard'
import { theme } from './theme'
import { decorators } from './decorators'
import { Domain, DomainKey } from '../../../../shared/types'
import animations from './animations'

function addNode(tree, obj, stateMap, activeKeyName) {
  const splitpath = obj.path.replace(/^\/|\/$/g, '').split('/')
  for (let i = 0; i < splitpath.length; i++) {
    const name = splitpath[i]
    let node = {
      id: name,
      name: name,
      type: 'directory',
      ...(stateMap[name] || { toggled: true }),
    }
    if (i == splitpath.length - 1) {
      node = {
        ...obj,
        ...node,
        name: <Box>{name}</Box>,
        active: activeKeyName === obj.path,
      }
    }
    tree[name] = tree[name] || node
    tree[name].children = tree[name].children || {}
    tree = tree[name].children
  }
}

function objectToArr(node) {
  Object.keys(node || {}).map((k) => {
    if (node[k].children) {
      objectToArr(node[k])
    }
  })
  if (node.children) {
    const values = Object.values(node.children)
    if (values.length) {
      node.children = values
      node.children.forEach(objectToArr)
    } else {
      delete node.children
    }
  }
}

function treeify(arr, stateMap, activeKeyName) {
  let tree = {}
  arr.map((i) => addNode(tree, i, stateMap, activeKeyName))
  objectToArr(tree)
  return tree
}

function transformKeys(
  domain: Domain,
  keys: DomainKey[],
  stateMap: {},
  activeKeyName: string
) {
  const node = treeify(
    keys.map((key) => {
      const fullPath = `${domain.name}/${key.key}`
      return {
        id: key.id,
        key: key.key,
        path: fullPath,
      }
    }),
    stateMap,
    activeKeyName
  )[domain.name]
  return node
}

export function KeysTree({ domain, keys }) {
  const { push, query } = useRouter()
  const activeKeyName = query.dataKeyName as string
  const activeKeyPath = `${domain.name}/${activeKeyName}`
  const [stateMap, setStateMap] = useState({})

  const data = useMemo(() => {
    return transformKeys(domain, keys, stateMap, activeKeyPath)
  }, [domain, keys, stateMap, activeKeyPath])

  const onToggle = useCallback(
    (node, toggled) => {
      let nextState = {
        ...stateMap,
      }

      const { key, children } = node

      let nodeState = nextState[node.id] || {}
      if (children) {
        nodeState.toggled = toggled
      } else {
        push(
          `/domains/${encodeURIComponent(domain.name)}/${encodeURIComponent(
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
    <Treebeard
      data={data}
      onToggle={onToggle}
      decorators={decorators}
      animations={animations}
      style={theme}
    />
  )
}
