export type Params = {
  poolSize: number
  maxQueueSize: number | undefined
  dropStrategy: 'earliest' | 'latest'
  processingInterval: number
  mode: 'normal' | 'dedupe'
  disableLogger: boolean
}

export type TaskMeta = {
  id?: string
  name?: string
  operation: string
}

export type TaskParams = {
  meta: TaskMeta
  cost?: number
  priority?: number
}

export type Task<T> = {
  id: string
  meta: TaskMeta
  task: () => Promise<T>
  cost: number
  priority: number
  key: string
  shareCount: number
  // Optional because tasks get pushed before these attributes are available
  resolve?: (value: T | PromiseLike<T>) => void
  reject?: () => void
  promise?: Promise<T>
}

export type ITaskQueue<T> = {
  name: string
  add: <T>(task: () => Promise<T>, params: TaskParams) => Promise<T>
  queue: Task<T>[]
  pendingQueue: Task<T>[]
}

export type Complete<T> = {
  [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>>
    ? T[P]
    : T[P] | undefined
}
