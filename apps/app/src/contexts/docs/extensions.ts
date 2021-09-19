import { ReactNodeViewRenderer } from '@tiptap/react'
// import StarterKit from '@tiptap/starter-kit'

import Dropcursor from '@tiptap/extension-dropcursor'
import Gapcursor from '@tiptap/extension-gapcursor'
import History from '@tiptap/extension-history'

import Bold from '@tiptap/extension-bold'
import Code from '@tiptap/extension-code'
import Italic from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import TextStyle from '@tiptap/extension-text-style'

import Blockquote from '@tiptap/extension-blockquote'
import BulletList from '@tiptap/extension-bullet-list'
import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
import Heading from '@tiptap/extension-heading'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
// import CodeBlock from '@tiptap/extension-code-block'

import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'

// import BubbleMenu from '@tiptap/extension-bubble-menu'

import lowlight from 'lowlight'
import { CodeBlockComponent } from './CodeBlockComponent'
// import { Extension } from '@tiptap/core'
// import Focus from '@tiptap/extension-focus'

export const extensions = [
  // Extension.create({
  //   name: 'literalTab',
  //   addKeyboardShortcuts() {
  //     return {
  //       Tab: () => {
  //         return this.editor.commands.insertContent('\t')
  //       },
  //     }
  //   },
  // }),

  Dropcursor,
  Gapcursor,
  History,

  Bold,
  Code,
  Italic,
  Strike,
  TextStyle,

  Blockquote,
  BulletList,
  Document,
  HardBreak,
  Heading,
  HorizontalRule,
  ListItem,
  OrderedList,
  Paragraph,
  Text,
  CodeBlockLowlight.extend({
    addNodeView() {
      return ReactNodeViewRenderer(CodeBlockComponent)
    },
  }).configure({ lowlight }),

  TaskList,
  TaskItem,
  Highlight.configure({ multicolor: true }),
  Placeholder,
  // BubbleMenu.configure({
  //   element: document.querySelector('.menu'),
  // }),
  // Focus.configure({
  //   className: 'has-focus',
  //   mode: 'shallowest',
  // }),
]
