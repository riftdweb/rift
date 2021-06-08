import { feedDAC, socialDAC } from '../skynet'
import { compileUserEntries } from './shared'
import { Entry } from './types'

type Reducer<State, Item> = {
  key: string
  fetch: () => Promise<State>
  mutate: (item: Item) => Promise<any>
  mutateLocal: (state: State, item: Item) => State
}

type Following = {
  id: string
  local?: boolean
}

type Followings = Following[]

function createReducerFollowing(
  userId: string
): Reducer<Followings, Following> {
  return {
    key: `following/${userId}`,
    fetch: async () => {
      const userIds = await socialDAC.getFollowingForUser(userId)
      return userIds.map((userId) => ({
        id: userId,
      }))
    },
    mutate: async (item: Following) => {
      const response = await socialDAC.follow(item.id)
      return response
    },
    mutateLocal: (state, item) =>
      state.concat({
        ...item,
        local: true,
      }),
  }
}

const stateMap = {
  following: [] as Followings,
  users: {} as {
    [userId: string]: Entry[]
  },
}
const updatedAtMap = {}
const canFetchMap = {}
const fetchMap = {}
const mutateMap = {}
const mutateQueue = []

// state accessors
const getState = (key: string) => {
  return stateMap[key]
}
const setState = <State>(key: string, state: State) => {
  stateMap[key] = state
}
const getUpdatedAt = (key: string) => {
  return updatedAtMap[key]
}
const setUpdatedAt = (key: string) => {
  updatedAtMap[key] = new Date().getTime()
}

// fetch lock accessors
const getCanFetch = (key: string) => {
  return canFetchMap[key]
}
const setCanFetch = (key: string, flag: boolean) => {
  canFetchMap[key] = flag
}

function queueMutateNetwork(key: string, state: any) {
  mutateQueue.push({
    key,
    state,
    ts: new Date().getTime(),
  })
}

async function processMutateQueue() {
  const mutation = mutateQueue.shift()
  const { key, state, ts } = mutation
  const mutate = mutateMap[key]

  await mutate(state)
  setUpdatedAt(key)

  if (!mutateQueue.find((mutation) => mutation.key === key)) {
    canFetchMap[key] = true
  }
}

function makeReducer<State, Item>(reducer: Reducer<State, Item>) {
  const { key } = reducer

  const fetch = async () => {
    const cachedState = getState(key)
    if (cachedState) {
      return cachedState
    }
    const state = await reducer.fetch()
    setState(key, state)
    return state
  }
  const update = async (item: Item) => {
    setCanFetch(key, false)

    const state = getState(key)
    const nextState = reducer.mutateLocal(state, item)
    setState(key, nextState)

    queueMutateNetwork(key, nextState)
  }

  // init
  fetchMap[key] = fetch
  mutateMap[key] = reducer.mutate

  return {
    fetch,
    update,
  }
}

function createReducerFeedUser(userId: string): Reducer<Entry[], Entry> {
  return {
    key: `feed/${userId}`,
    fetch: async () => {
      return await compileUserEntries(userId)
    },
    mutate: async (entry: Entry) => {
      return await feedDAC.createPost(entry.post.content)
    },
    mutateLocal: (state, item) =>
      state.concat({
        ...item,
        local: true,
      }),
  }
}

const data = {}
const methods = {}

async function main() {
  const userId = ''
  const reducerFollowing = createReducerFollowing(userId)
  data[reducerFollowing.key] = reducerFollowing
}
