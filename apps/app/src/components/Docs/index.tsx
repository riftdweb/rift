import { Box, Flex } from '@riftdweb/design-system'
import { DocsMenu } from './DocsMenu'
import { Editor } from './Editor/Editor'
import { FunctionMenu } from './FunctionMenu'
import { styles } from './styles'

export function Docs() {
  return (
    <Flex
      css={{
        position: 'relative',
        gap: '$3',
        margin: '$5 0',
        justifyContent: 'space-between',
        ...styles,
      }}
    >
      {/* <BubbleMenu editor={editor} /> */}
      <Box
        css={{
          width: '250px',
          display: 'none',
          '@bp2': {
            width: '200px',
            display: 'block',
          },
          '@bp3': {
            width: '250px',
          },
        }}
      >
        <Box
          css={{
            position: 'sticky',
            top: '$5',
            backgroundColor: '$gray3',
            borderRadius: '0 $2 $2 0',
          }}
        >
          <DocsMenu />
        </Box>
      </Box>
      <Box
        css={{
          minHeight: '500px',
          width: '100%',
          '@bp3': {
            width: '800px',
          },
        }}
      >
        <Editor />
      </Box>
      <Box
        css={{
          width: '250px',
          display: 'none',
          '@bp3': {
            display: 'block',
          },
        }}
      >
        <Box
          css={{
            position: 'sticky',
            top: '$5',
            backgroundColor: '$gray3',
            borderRadius: '$2 0 0 $2',
          }}
        >
          <FunctionMenu />
        </Box>
      </Box>
    </Flex>
  )
}
