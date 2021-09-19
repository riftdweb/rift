import { BubbleMenu as TTBubbleMenu } from '@tiptap/react'
import { Flex, Panel } from '@riftdweb/design-system'
import { MenuItem } from './FunctionMenu/MenuItem'

export function BubbleMenu({ editor }) {
  return (
    editor && (
      <TTBubbleMenu
        editor={editor}
        tippyOptions={{
          placement: 'bottom-start',
        }}
      >
        <Panel css={{ padding: '$1' }}>
          <Flex
            css={{
              flexDirection: 'column',
              gap: '$1',
              justifyContent: 'space-between',
            }}
          >
            <MenuItem
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              name="bold"
              kbd={['⌘', 'shift', 7]}
              md="**"
            />
            <MenuItem
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              name="italic"
              kbd={['⌘', 'shift', 7]}
              md="*"
            />
            <MenuItem
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              name="strike"
              kbd={['⌘', 'shift', 7]}
            />
            <MenuItem
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              isActive={editor.isActive('highlight')}
              name="highlight"
              kbd={['⌘', 'Shift', 'H']}
            />
          </Flex>
        </Panel>
      </TTBubbleMenu>
    )
  )
}
