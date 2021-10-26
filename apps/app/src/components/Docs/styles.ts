export const styles = {
  '.ProseMirror': {
    padding: '$2',
    color: '$hiContrast',

    borderBottom: '2px solid $gray2',
    '&:focus': {
      outline: 'none',
      borderBottom: '2px solid $gray2',
    },

    '.has-focus': {
      borderLeft: '1px solid $blue5',
      borderRadius: '3px',
    },

    '> * + *': {
      marginTop: '0.75em',
    },

    'ul, ol': {
      padding: '0 1rem',
    },

    'ul[data-type="taskList"]': {
      listStyle: 'none',
      padding: 0,
      li: {
        display: 'flex',
        alignItems: 'center',

        '> label': {
          flex: '0 0 auto',
          marginRight: '0.5rem',
        },
      },
    },

    'h1, h2, h3, h4, h5, h6': {
      lineHeight: 1.1,
    },

    '> p': {
      lineHeight: '20px',
    },

    code: {
      backgroundColor: '$gray6',
      color: '#616161',
    },

    '.code-block': {
      position: 'relative',

      select: {
        position: 'absolute',
        right: '0.5rem',
        top: '0.5rem',
      },
    },

    pre: {
      backgroundColor: 'hsla(211, 73%, 12%, 1) !important',
      color: 'white',
      fontFamily: '"JetBrainsMono", monospace',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem !important',

      code: {
        color: 'inherit',
        padding: 0,
        background: 'none',
        fontSize: '0.8rem',
      },

      '.hljs-comment, .hljs-quote': {
        color: '#616161',
      },

      '.hljs-variable, .hljs-template-variable, .hljs-attribute, .hljs-tag, .hljs-name, .hljs-regexp, .hljs-link, .hljs-name, .hljs-selector-id, .hljs-selector-class': {
        color: '#F98181',
      },

      '.hljs-number, .hljs-meta, .hljs-built_in, .hljs-builtin-name, .hljs-literal, .hljs-type, .hljs-params': {
        color: '#FBBC88',
      },

      '.hljs-string, .hljs-symbol, .hljs-bullet': {
        color: '#B9F18D',
      },

      '.hljs-title, .hljs-section': {
        color: '#FAF594',
      },

      '.hljs-keyword, .hljs-selector-tag': {
        color: '#70CFF8',
      },

      '.hljs-emphasis': {
        fontStyle: 'italic',
      },

      '.hljs-strong': {
        fontWeight: 700,
      },
    },

    img: {
      maxWidth: '100%',
      height: 'auto',
    },

    blockquote: {
      paddingLeft: '1rem',
      borderLeft: '2px solid $gray6',
      borderRadius: '0 !important',
    },

    hr: {
      border: 'none',
      borderTop: '2px solid $gray6',
      margin: '2rem 0',
    },

    'p.is-editor-empty:first-child::before': {
      content: 'attr(data-placeholder)',
      float: 'left',
      color: '#ced4da',
      pointerEvents: 'none',
      height: 0,
    },
  },
}
