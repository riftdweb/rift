import { createLogger } from '@riftdweb/logger'
import { createRxDatabase, removeRxDatabase, RxDatabase } from 'rxdb'
import { getRxStoragePouch, addPouchPlugin } from 'rxdb/plugins/pouchdb'
import { IAccountCollection, accountStore } from './account'
import { feedDomainStore, IFeedDomainCollection } from './feedDomain'
import { entryStore, IEntryCollection } from './entry'
import { feedConfigStore, IFeedConfigCollection } from './feedConfig'
import { feedStore, IFeedIndexCollection } from './feedIndex'
import { IFeedKeywordCollection, feedKeywordStore } from './feedKeyword'
import { ILoaderCollection, loaderStore } from './loader'
import { IUserCollection, userStore } from './user'

// Add pouch adapters
addPouchPlugin(require('pouchdb-adapter-idb'))
addPouchPlugin(require('pouchdb-adapter-memory'))

const log = createLogger('rx')

type ICollections = {
  user: IUserCollection
  account: IAccountCollection
  entry: IEntryCollection
  pendingentry: IEntryCollection
  feedindex: IFeedIndexCollection
  feedconfig: IFeedConfigCollection
  feedkeyword: IFeedKeywordCollection
  feeddomain: IFeedDomainCollection
}

type IStates = {
  loaders: ILoaderCollection
}

type DB = RxDatabase<ICollections>
type State = RxDatabase<IStates>

export let db: DB = null
// @ts-ignore
window.db = db
export let state: State = null
// @ts-ignore
window.state = state

async function initDb(userId = 'rift') {
  log('Init db')

  // reset for dev
  // await removeRxDatabase(userId, getRxStoragePouch('idb'))

  // db.removeCollection('heroes')
  // db.removeCollection('users')

  db = await createRxDatabase({
    name: userId,
    storage: getRxStoragePouch('idb'),
    multiInstance: true,
    eventReduce: true,
  })

  await db.addCollections({
    user: userStore,
    account: accountStore,
    entry: entryStore,
    pendingentries: entryStore,
    feedindex: feedStore,
    feedconfig: feedConfigStore,
    feeddomain: feedDomainStore,
    feedkeyword: feedKeywordStore,
  })
}

async function initState() {
  log('Init state')

  state = await createRxDatabase({
    name: 'state',
    storage: getRxStoragePouch('memory'),
  })

  await state.addCollections({
    loaders: loaderStore,
  })
}

export async function initStores(userId = 'rift') {
  await initDb(userId)
  await initState()
}
