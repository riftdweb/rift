import { Box, Button, Flex, Text } from '@riftdweb/design-system'
import { useDocs } from '../../../contexts/docs'
import { ScrollArea } from '../../_shared/ScrollArea'
import { MenuItem } from './MenuItem'

type HeaderProps = {
  name: string
  children?: React.ReactNode
}

function Header({ name, children }: HeaderProps) {
  return (
    <Flex
      css={{
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: '$2 $2 $2',
      }}
    >
      <Text css={{ color: '$gray700' }}>{name}</Text>
      {children}
    </Flex>
  )
}

export function FunctionMenu() {
  const { editor, menuMode, setMenuMode } = useDocs()
  if (!editor) {
    return null
  }

  return (
    <Box
      css={{
        padding: '$2 $2 $4 $2',
      }}
    >
      <ScrollArea>
        <Flex css={{ flexDirection: 'column' }}>
          <Header name="Blocks">
            <Button
              size="0"
              onClick={() => setMenuMode(menuMode === 'kbd' ? 'md' : 'kbd')}
            >
              {menuMode === 'kbd' ? 'Keyboard' : 'Mardown'}
            </Button>
          </Header>
          <MenuItem
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={editor.isActive('paragraph')}
            name="paragraph"
            kbd={['⌘', 'Alt', '0']}
          />
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <MenuItem
              onClick={() =>
                editor.chain().focus().toggleHeading({ level }).run()
              }
              isActive={editor.isActive('heading', { level })}
              name={`h${level}`}
              kbd={['⌘', 'Alt', level]}
              md={repeat('#', level)}
            />
          ))}
          <MenuItem
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            name="ordered list"
            kbd={['⌘', 'Shift', 7]}
            md="1."
          />
          <MenuItem
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            name="bullet list"
            kbd={['⌘', 'Shift', 8]}
            md="-"
          />
          <MenuItem
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            name="code block"
            kbd={['⌘', 'Alt', 'C']}
            md="```"
          />
          <MenuItem
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            name="blockquote"
            kbd={['⌘', 'Shift', 'B']}
            md=">"
          />
          <MenuItem
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            name="horizontal rule"
            md="---"
          />
          <MenuItem
            onClick={() => editor.chain().focus().setHardBreak().run()}
            name="hard break"
            kbd={['⌘', 'Enter']}
          />

          <Header name="Formatting" />
          <MenuItem
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            name="bold"
            kbd={['⌘', 'B']}
            md="**"
          />
          <MenuItem
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            name="italic"
            kbd={['⌘', 'I']}
            md="*"
          />
          <MenuItem
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            name="strike"
            kbd={['⌘', 'Shift', 'X']}
          />
          <MenuItem
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive('highlight')}
            name="highlight"
            kbd={['⌘', 'Shift', 'H']}
            md="=="
          />
          <MenuItem
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            name="code"
            kbd={['⌘', 'E']}
            md="`"
          />
          <MenuItem
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
            name="reset formatting"
          />
          <MenuItem
            onClick={() => editor.chain().focus().clearNodes().run()}
            name="reset block"
          />
        </Flex>
      </ScrollArea>
    </Box>
  )
}

function repeat(str: string, times: number) {
  let result = ''
  for (let i = 0; i < times; i++) {
    result += str
  }
  return result
}
