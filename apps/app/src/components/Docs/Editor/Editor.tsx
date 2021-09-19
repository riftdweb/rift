import { EditorContent } from '@tiptap/react'
import { Flex, Box } from '@riftdweb/design-system'
import { useDocs } from '../../../contexts/docs'
import { EditorSkeleton } from './EditorSkeleton'
import { EditorHeading } from './EditorHeading'
import { NonIdealState } from '../../_shared/NonIdealState'

export function Editor() {
  const { docId, editor, isInitializing } = useDocs()

  return (
    <Flex
      css={{
        flex: 1,
        flexDirection: 'column',
        gap: '$3',
        padding: '0 $3',
      }}
    >
      <EditorHeading />
      <Box
        css={{
          // border: '1px solid $gray400',
          // backgroundColor: '$gray100',
          borderRadius: '$2',
          // borderLeft: '1px solid $gray200',
        }}
      >
        {docId ? (
          isInitializing ? (
            <EditorSkeleton />
          ) : (
            <EditorContent editor={editor} />
          )
        ) : (
          <Box css={{ paddingTop: '$9' }}>
            <Box
              css={{
                display: 'block',
                '@bp2': {
                  display: 'none',
                },
              }}
            >
              <NonIdealState
                title="Docs"
                message="Open Rift on a wider screen to select a document."
              />
            </Box>
            <Box
              css={{
                display: 'none',
                '@bp2': {
                  display: 'block',
                },
              }}
            >
              <NonIdealState
                title="Docs"
                message="Select a document to get started."
              />
            </Box>
          </Box>
        )}
      </Box>
    </Flex>
  )
}
