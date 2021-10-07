import { Box, Flex, Text } from '@riftdweb/design-system'
import { Doc, useDocs, EntriesState, Link, ScrollArea } from '@riftdweb/core'
import { DocContextMenu } from '../_shared/BlockContextMenu'
import { AddDoc } from './AddDoc'
import { DocsMenuSkeleton } from './DocsMenuSkeleton'

function Header({ name }) {
  return <Text css={{ color: '$gray700' }}>{name}</Text>
}

export function DocsMenu() {
  const { docId, docList } = useDocs()
  return (
    <Flex
      css={{
        flexDirection: 'column',
        height: '60vh',
      }}
    >
      <Flex
        css={{
          gap: '$1',
          padding: '$4 $3 $2',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Header
          name={docList.data ? `Docs (${docList.data.entries.length})` : 'Docs'}
        />
        <AddDoc />
      </Flex>
      <Box
        css={{
          flex: 1,
          paddingBottom: '$2',
          overflow: 'hidden',
        }}
      >
        <ScrollArea>
          <EntriesState
            loadingElement={<DocsMenuSkeleton />}
            response={docList}
            emptyMessage="Add a doc to get started"
          >
            {docList.data?.entries.sort(sort).map((doc) => (
              <Link
                to={`/docs/${doc.id}`}
                key={doc.id}
                css={{
                  display: 'block',
                  padding: '$1 $3',
                  backgroundColor: docId === doc.id ? '$gray400' : 'none',
                  textDecoration: 'none',
                  '&:hover': {
                    backgroundColor: '$gray400',
                    textDecoration: 'none',
                  },
                }}
              >
                <Flex
                  css={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    css={{
                      fontWeight: docId === doc.id ? '500' : '400',
                      overflow: 'hidden',
                      lineHeight: '20px',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {doc.name}
                  </Text>
                  <DocContextMenu docId={doc.id} />
                </Flex>
              </Link>
            ))}
          </EntriesState>
        </ScrollArea>
      </Box>
    </Flex>
  )
}

function sort(a: Doc, b: Doc) {
  return a.updatedAt < b.updatedAt ? 1 : -1
}
