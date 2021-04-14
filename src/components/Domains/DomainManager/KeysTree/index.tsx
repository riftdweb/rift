import { Box } from '@modulz/design-system'
import {
  ClipboardIcon,
  TriangleDownIcon,
  TriangleRightIcon,
} from '@radix-ui/react-icons'
import { useRouter } from 'next/router'
import React, { useCallback, useState } from 'react'
import { Treebeard } from 'react-treebeard'
import Decorators from 'react-treebeard/dist/components/Decorators'
import theme from './theme'

const _data = {
  name: 'localhost',
  toggled: true,
  children: [
    {
      name: 'newcontent',
      children: [
        {
          name: (
            <Box>
              index.json
              <Box css={{ position: 'absolute', right: 0, top: 0 }}>
                <ClipboardIcon />
              </Box>
            </Box>
          ),
          key: 'localhost/newcontent/index.json',
        },
      ],
    },
    {
      name: 'interactions',
      children: [
        { name: 'index.json', key: 'localhost/interactions/index.json' },
        { name: 'page_0.json', key: 'localhost/interactions/page_0.json' },
        { name: 'page_1.json', key: 'localhost/interactions/page_1.json' },
      ],
    },
  ],
}
const decorators = {
  ...Decorators,
  Toggle: ({ style, onClick }) => {
    const { height, width } = style

    return (
      <div style={style.base} onClick={onClick}>
        <div style={style.wrapper}>
          <svg {...{ height, width }}>
            <TriangleRightIcon />
          </svg>
        </div>
      </div>
    )
  },
  Header: ({ onSelect, node, style, customStyles }) => (
    <div style={style.base} onClick={onSelect}>
      <div
        style={
          node.selected
            ? { ...style.title, ...customStyles.header.title }
            : style.title
        }
      >
        {node.name}
      </div>
    </div>
  ),
}

export function KeysTree({ domain, keys }) {
  const { push } = useRouter()
  const [data, setData] = useState(_data)
  const [cursor, setCursor] = useState<any>(false)

  const onToggle = useCallback(
    (node, toggled) => {
      const { key, children } = node
      if (cursor) {
        cursor.active = false
      }
      if (children) {
        node.toggled = toggled
      } else {
        node.active = true
        push(
          `/domains/${encodeURIComponent(domain.name)}/${encodeURIComponent(
            key
          )}`
        )
      }
      setCursor(node)

      setData(Object.assign({}, data))
    },
    [data, setData, cursor, setCursor, push]
  )

  return (
    <Treebeard
      data={data}
      onToggle={onToggle}
      decorators={decorators}
      style={theme}
    />
  )
}
