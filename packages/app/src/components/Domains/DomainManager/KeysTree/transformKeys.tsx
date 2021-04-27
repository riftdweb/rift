import { Domain, DomainKey } from '../../../../shared/types'

type NodeType = 'file' | 'directory' | 'static'

export type TreeNode = {
  id: string
  name: string
  type: NodeType
  isRootDomain?: boolean
  toggled?: boolean
  active?: boolean
  domain?: Domain
  // foo/file.json
  key: string
  // domain/foo/file.json
  fullKey: string
  // fs/discoverable/domain/foo/file.json
  treeKey: string
  children: Tree | TreeNode[]
}

export type TreeNodeArr = TreeNode & {
  children: Tree | TreeNode[]
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

type TreeArr = {
  [pathKey: string]: TreeNodeArr
}

type StateMap = {
  [domainKeyName: string]: {
    toggled: boolean
  }
}

type DomainKeyTree = DomainKey & {
  treeKey: string
  domain?: Domain
  type: NodeType
}

function addNode(
  tree: Tree,
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

    const isStatic = [
      'domains',
      'domains/discoverable',
      'domains/hidden',
    ].includes(treeKey)

    let node: TreeNode = {
      id,
      name: name,
      domain: domainKey.domain,
      fullKey,
      key,
      treeKey,
      type: isStatic ? 'static' : 'directory',
      isRootDomain:
        !isStatic && pathParts.length === 3 && i === pathParts.length - 1,
      toggled: state.toggled,
      children: {},
    }

    if (i == pathParts.length - 1 && domainKey.type === 'file') {
      node = {
        id: treeKey,
        name: name,
        key,
        fullKey,
        treeKey,
        domain: domainKey.domain,
        type: 'file',
        toggled: state.toggled,
        active: activeKeyName === treeKey,
        children: {},
      }
    }

    tree[name] = tree[name] || node
    tree[name].children = tree[name].children || {}
    tree = tree[name].children as Tree
  }
}

function objectToArrNode(node: TreeNodeArr) {
  if (node.children) {
    const values = Object.values(node.children)
    if (values.length) {
      node.children = values
      node.children.forEach(objectToArrNode)
    } else {
      delete node.children
    }
  }
}

function objectToArr(tree: TreeArr) {
  Object.keys(tree || {}).map((k) => {
    if (tree[k].children) {
      objectToArrNode(tree[k])
    }
  })
}

export function transformKeys(
  domains: Domain[],
  stateMap: {},
  activeKeyName: string
) {
  // Set up organizational nodes
  const rootTreeElements: DomainKeyTree[] = [
    {
      id: 'domains',
      key: 'domains',
      type: 'static',
      treeKey: 'domains',
    },
    {
      id: 'domains/discoverable',
      key: 'domains/discoverable',
      type: 'static',
      treeKey: 'domains/discoverable',
    },
    {
      id: 'domains/hidden',
      key: 'domains/hidden',
      type: 'static',
      treeKey: 'domains/hidden',
    },
  ]

  // Force domains to show even if they do not have keys
  const domainTreeElements: DomainKeyTree[] = domains.map((domain) => {
    const treeKey = `domains/discoverable/${domain.name}`
    return {
      id: domain.id,
      key: domain.name,
      domain,
      type: 'directory',
      treeKey,
    }
  })

  // Gather all keys
  const treeKeyElements = domains.map((domain) =>
    domain.keys.map(
      (key: DomainKey): DomainKeyTree => {
        const treeKey = `domains/discoverable/${domain.name}/${key.key}`
        return {
          id: key.id,
          key: key.key,
          domain,
          type: 'file',
          treeKey,
        }
      }
    )
  )

  // Order of array is important for ensuring root, domain, and folder node data
  const treeKeys = rootTreeElements
    .concat(domainTreeElements)
    .concat(treeKeyElements.flat())

  let rootTree: Tree = {}

  treeKeys.map((domainKey) =>
    addNode(rootTree, domainKey, stateMap, activeKeyName)
  )

  // console.log(rootTree)
  objectToArr(rootTree)
  // console.log(rootTree)
  return rootTree['domains']
  // return tree
}
