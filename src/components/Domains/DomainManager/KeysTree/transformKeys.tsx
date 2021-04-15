import { Domain, DomainKey } from '../../../../shared/types'

export type TreeNode = {
  id: string
  name: string
  type: 'file' | 'directory' | 'static'
  toggled?: boolean
  active?: boolean
  domain?: Domain
  // foo/file.json
  key: string
  // domain/foo/file.json
  fullKey: string
  // fs/discoverable/domain/foo/file.json
  treeKey: string
  children: Tree
}

export type TreeNodeFile = TreeNode & {
  type: 'file'
}

export type TreeNodeDirectory = TreeNode & {
  type: 'directory'
}

export type TreeNodeStatic = TreeNode & {
  type: 'static'
}

type Tree = {
  [pathKey: string]: TreeNode
}

type StateMap = {
  [domainKeyName: string]: {
    toggled: boolean
  }
}

type DomainKeyTree = DomainKey & {
  treeKey: string
}

function addNode(
  tree: Tree,
  domain: Domain,
  domainKey: DomainKeyTree,
  stateMap: StateMap,
  activeKeyName: string
) {
  const pathParts = domainKey.treeKey.replace(/^\/|\/$/g, '').split('/')
  for (let i = 0; i < pathParts.length; i++) {
    const name = pathParts[i]
    const treeKey = pathParts.slice(0, i + 1).join('/')
    const id = treeKey
    // remove domain and zone for real directory fullKey
    const fullKey = pathParts.slice(2, i + 1).join('/')
    const key = pathParts.slice(3, i + 1).join('/')
    const state = stateMap[id] || { toggled: true }

    let node: TreeNode = {
      id,
      name: name,
      domain: domain,
      fullKey,
      key,
      treeKey,
      type: ['domains', 'domains/discoverable', 'domains/hidden'].includes(
        treeKey
      )
        ? 'static'
        : 'directory',
      toggled: state.toggled,
      children: {},
    }

    if (i == pathParts.length - 1) {
      node = {
        id: treeKey,
        name: name,
        key,
        fullKey,
        treeKey,
        domain: domain,
        type: 'file',
        toggled: state.toggled,
        active: activeKeyName === treeKey,
        children: {},
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

export function transformKeys(
  domain: Domain,
  keys: DomainKey[],
  stateMap: {},
  activeKeyName: string
) {
  const treeKeys = keys.map(
    (key: DomainKey): DomainKeyTree => {
      const treeKey = `domains/discoverable/${domain.name}/${key.key}`
      return {
        id: key.id,
        key: key.key,
        treeKey,
      }
    }
  )

  let tree: Tree = {}

  if (treeKeys.length) {
    treeKeys.map((domainKey) =>
      addNode(tree, domain, domainKey, stateMap, activeKeyName)
    )
  } else {
    tree = {
      [domain.id]: {
        id: domain.id,
        name: domain.name,
        key: domain.name,
        fullKey: domain.name,
        treeKey: `domains/discoverable/${domain.name}`,
        domain,
        type: 'directory',
        toggled: false,
        children: {},
      } as TreeNode,
    } as Tree
  }

  const rootTree: Tree = {
    domains: {
      id: 'domains',
      key: 'domains',
      treeKey: 'domains',
      fullKey: '',
      name: 'Domains',
      type: 'static',
      toggled: true,
      children: {
        discoverable: {
          id: 'discoverable',
          key: 'discoverable',
          fullKey: '',
          treeKey: 'domains/discoverable',
          name: 'Discoverable',
          type: 'static',
          toggled: true,
          children: tree,
        },
        hidden: {
          id: 'hidden',
          key: 'hidden',
          fullKey: '',
          treeKey: 'domains/hidden',
          name: 'Hidden',
          type: 'static',
          toggled: true,
          children: tree,
        },
      },
    },
  }

  console.log(rootTree)
  objectToArr(rootTree)
  console.log(rootTree)
  return tree['domains']
  // return tree
}
