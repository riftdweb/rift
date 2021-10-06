import { createLogger } from '@riftdweb/logger'
import { Feed } from '@riftdweb/types'
import { v4 as uuid } from 'uuid'
import debounce from 'lodash/debounce'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useHistory } from 'react-router-dom'
import useSWR, { SWRResponse } from 'swr'
import { upsertItem } from '../../shared/collection'
import { getDataKeyDocs } from '../../shared/dataKeys'
import { useSkynet } from '../skynet'
import { useEditor } from '@tiptap/react'
import { useParamId } from './useParamId'
import { defaultContent } from './defaultContent'
import { extensions } from './extensions'
import { TaskQueue } from '@riftdweb/queue'

const log = createLogger('docs')

const dataKeyDocList = getDataKeyDocs('index')

const docListUpdateQueue = TaskQueue('docs', {
  maxQueueSize: 1,
  dropStrategy: 'earliest',
})
const docDataUpdateQueue = TaskQueue('docData', {
  maxQueueSize: 1,
  dropStrategy: 'earliest',
})

export type DocData = {
  type: 'doc'
  content: any[]
}

export type Doc = {
  id: string
  name: string
  updatedAt: number
}

type MenuMode = 'kbd' | 'md'

type DocState = {
  isSyncing: boolean
  isFetching: boolean
  error?: any
  localState?: DocData
  networkState?: DocData
}

const emptyDocState: DocState = {
  isSyncing: false,
  isFetching: false,
}

type DocStateMap = Record<string, DocState>

type State = {
  isInitializing: boolean
  editor: any
  docId?: string
  doc?: Doc
  docList: SWRResponse<Feed<Doc>, any>
  docStateMap: DocStateMap
  docState: DocState
  addDoc: (doc: Partial<Doc>, redirect?: boolean) => boolean
  removeDoc: (docId: string, redirect?: boolean) => boolean
  renameDoc: (docId: string, name: string) => boolean
  userHasNone: boolean
  menuMode: MenuMode
  setMenuMode: (mode: MenuMode) => void
}

const DocsContext = createContext({} as State)
export const useDocs = () => useContext(DocsContext)

type Props = {
  children: React.ReactNode
}

const localInterval = 200
const localFuncMap = {}
// Updating local state should be debounced to avoid excessive rendering
function updateDocDataLocal(docId: string, update: () => void) {
  let func = localFuncMap[docId]
  if (!func) {
    func = debounce((f) => f(), localInterval)
    localFuncMap[docId] = func
  }
  return func(update)
}

const networkInterval = 3000
const networkFuncMap = {}
// Updating network state should be debounced to avoid excessive requests
function updateDocDataNetwork(docId: string, update: () => void) {
  let func = networkFuncMap[docId]
  if (!func) {
    func = debounce((f) => f(), networkInterval)
    networkFuncMap[docId] = func
  }
  return func(update)
}

export function DocsProvider({ children }: Props) {
  const openDocId = useParamId()
  const { Api, isReady, appDomain, getKey } = useSkynet()
  const history = useHistory()

  const [menuMode, setMenuMode] = useState<MenuMode>('kbd')

  const docList = useSWR<Feed<Doc>>(
    getKey([appDomain, dataKeyDocList]),
    async () => {
      const response = await Api.getJSON<Doc[]>({
        path: dataKeyDocList,
        priority: 4,
      })
      return {
        entries: response.data?.length ? response.data : [],
        updatedAt: new Date().getTime(),
      }
    },
    {
      revalidateOnFocus: false,
    }
  )

  const { userHasNone } = useHasValidated<Doc>(docList.data)

  const doc = useMemo(
    () => docList.data?.entries.find((doc) => doc.id === openDocId),
    [docList, openDocId]
  )

  const setDoc = useCallback(
    (docs: Doc[]) => {
      const func = async () => {
        // Update cache immediately
        docList.mutate(
          () => ({
            entries: docs,
            updatedAt: new Date().getTime(),
          }),
          false
        )

        const task = () =>
          Api.setJSON({
            path: dataKeyDocList,
            json: docs,
            priority: 4,
          })

        await docListUpdateQueue.add(task, {
          meta: {
            name: 'docs',
            operation: 'set',
          },
        })
      }
      func()
    },
    [Api, docList]
  )

  const addDoc = useCallback(
    (doc: Partial<Doc>, redirect?: boolean): boolean => {
      log('addDoc')
      if (doc.name) {
        const validatedDoc: Doc = {
          id: uuid(),
          name: doc.name,
          updatedAt: new Date().getTime(),
        }

        setDoc(upsertItem(docList.data.entries, validatedDoc))

        if (redirect) {
          history.push(`/docs/${validatedDoc.id}`)
        }

        return true
      }
      return false
    },
    [history, docList, setDoc]
  )

  const renameDoc = useCallback(
    (docId: string, name: string): boolean => {
      log('renameDoc')
      const doc = docList.data.entries.find((doc) => doc.id === docId)

      if (!doc) {
        return false
      }

      const updatedDoc: Doc = {
        ...doc,
        name,
        updatedAt: new Date().getTime(),
      }

      setDoc(upsertItem(docList.data.entries, updatedDoc))

      return true
    },
    [docList, setDoc]
  )

  const removeDoc = useCallback(
    (docId: string): boolean => {
      log('removeDoc')
      if (!docId) {
        return false
      }

      if (!docList.data) {
        return false
      }

      const docIndex = docList.data.entries.findIndex((doc) => doc.id === docId)

      if (!~docIndex) {
        return false
      }

      // When removing an open doc we need to route to another one
      if (openDocId === docId) {
        if (docIndex > 0) {
          // load previous
          history.push(`/docs/${docList.data.entries[docIndex - 1].id}`)
        } else if (docIndex === 0 && docList.data.entries.length > 1) {
          // load new first
          history.push(`/docs/${docList.data.entries[1].id}`)
        } else {
          // load base user data path
          history.push('/docs')
        }
      }

      setDoc(docList.data.entries.filter((item) => item.id !== docId))

      return true
    },
    [history, docList, setDoc, openDocId]
  )

  const [docStateMap, setDocStateMap] = useState<DocStateMap>({})
  const docState = useMemo(() => {
    return (
      docStateMap[openDocId] || {
        ...emptyDocState,
        isFetching: true,
      }
    )
  }, [openDocId, docStateMap])

  const upsertDocState = useCallback(
    (docId: string, doc: Partial<DocState>) => {
      setDocStateMap((data) => ({
        ...data,
        [docId]: {
          ...(data[docId] || emptyDocState),
          ...doc,
        },
      }))
    },
    [setDocStateMap]
  )

  const isInitializing = !docList.data || docState.isFetching
  const currentDocPath = getDataKeyDocs(openDocId)
  const currentDocFetchKey = getKey(['docs', openDocId])

  useEffect(
    () => {
      if (!openDocId || !currentDocFetchKey) {
        return null
      }
      const func = async () => {
        const currentDocId = openDocId
        let docState = docStateMap[currentDocId]

        // Initialize docState
        if (!docState) {
          docState = {
            ...emptyDocState,
            isFetching: true,
          }
          upsertDocState(currentDocId, docState)
        } else {
          upsertDocState(currentDocId, {
            isFetching: true,
          })
        }

        // Initialize docData
        if (!docState.networkState) {
          try {
            const { data } = await Api.getJSON<DocData>({
              path: currentDocPath,
              priority: 4,
            })
            const docData = data || defaultContent

            upsertDocState(currentDocId, {
              networkState: docData,
              localState: docData,
              isFetching: false,
            })

            editor?.commands.setContent(docData)
          } catch (e) {
            upsertDocState(currentDocId, {
              error: e,
              isFetching: false,
            })

            editor?.commands.setContent('')
          }
        } else {
          editor?.commands.setContent(docState.localState)
          upsertDocState(currentDocId, {
            isFetching: false,
          })
        }
      }
      func()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    currentDocFetchKey ? currentDocFetchKey : [currentDocFetchKey]
  )

  const handleUpdate = useCallback(
    (editor: any) => {
      updateDocDataLocal(openDocId, () => {
        log('local')
        const json = editor.getJSON()

        upsertDocState(openDocId, {
          localState: json,
        })

        updateDocDataNetwork(openDocId, async () => {
          upsertDocState(openDocId, {
            isSyncing: true,
          })

          const task = async () => {
            log('syncing', currentDocPath)
            try {
              await Api.setJSON({
                path: currentDocPath,
                json,
                priority: 4,
              })
            } catch (e) {
              log('syncing error', currentDocPath)
            }
            log('syncing done', currentDocPath)
          }

          await docDataUpdateQueue.add(task, {
            meta: {
              name: openDocId,
              operation: 'update',
            },
          })

          upsertDocState(openDocId, {
            isSyncing: false,
          })
        })
      })
    },
    [Api, openDocId, currentDocPath, upsertDocState]
  )

  const ref = useRef<any>({})

  useEffect(() => {
    // Mutable handleUpdate reference so that editor always calls the latest instance
    ref.current.handleUpdate = handleUpdate
  }, [handleUpdate])

  const editor = useEditor({
    extensions,
    content: '',
    onUpdate: ({ editor }) => {
      ref.current.handleUpdate(editor)
    },
  })

  useEffect(() => {
    if (!isReady || !docList.data || !openDocId) {
      return
    }
    if (!docList.data?.entries.find(({ id }) => id === openDocId)) {
      history.replace('/docs')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, openDocId, docList])

  const value = {
    isInitializing,
    editor,
    doc,
    docId: openDocId,
    docList,
    docStateMap,
    docState,
    menuMode,
    setMenuMode,
    addDoc,
    removeDoc,
    renameDoc,
    userHasNone,
  }

  return <DocsContext.Provider value={value}>{children}</DocsContext.Provider>
}

function useHasValidated<T>(data: Feed<T>) {
  const [hasValidated, setHasValidated] = useState<boolean>(false)
  const [userHasNone, setUserHasNone] = useState<boolean>(false)
  // Track whether the user has no docs yet so that we can adjust
  // how data validating states are handled
  useEffect(() => {
    if (!hasValidated && data) {
      setHasValidated(true)
      setUserHasNone(!data.entries || !data.entries.length)
    }
  }, [data, hasValidated, setHasValidated, setUserHasNone])

  return {
    userHasNone,
  }
}
