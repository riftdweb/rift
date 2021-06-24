import { makeObservable, observable, computed, action } from 'mobx'
import { computedFn } from 'mobx-utils'
import { createLogger } from '../../shared/logger'

const log = createLogger('mobx')

export type Node = {
  id: string
  parentId?: string
  type: string
  data: {
    title?: string
  }
  children?: string[]
}

export type NodeMap = Map<string, Node>

export type Mutation = {
  action: 'create' | 'update' | 'delete'
  node: Node
}

export class DataDac {
  nodeMap: NodeMap = new Map()

  constructor() {
    makeObservable(this, {
      nodeMap: observable,
      // nodes: computed,
      create: action,
      update: action,
      delete: action,
    })
  }

  create({ node }: Mutation) {
    this.nodeMap.set(node.id, node)
    return true
  }

  update({ node }: Mutation) {
    const existingNode = this.nodeMap.get(node.id)
    this.nodeMap.set(node.id, {
      ...existingNode,
      ...node,
    })
    return true
  }

  delete(id: string) {
    this.nodeMap.delete(id)
    return true
  }

  getNodes(parentId?: string) {
    return this.nodes.filter((node) => node.parentId === parentId)
  }

  get nodes(): Node[] {
    const entries = Array.from(this.nodeMap)

    return entries.map(([_id, value]) => value)
  }
}

export const dac = new DataDac()
