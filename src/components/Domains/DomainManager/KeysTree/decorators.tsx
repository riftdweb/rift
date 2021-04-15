import React from 'react'
import { Box } from '@modulz/design-system'
import { TriangleRightIcon } from '@radix-ui/react-icons'
import Decorators from 'react-treebeard/dist/components/Decorators'
import { Container } from './Container'

export const decorators = {
  ...Decorators,
  // Toggle control on the togglable header menu items
  Toggle: ({ style, onClick }) => {
    const { height, width } = style

    return (
      <Box style={style.base} onClick={onClick}>
        <Box style={style.wrapper}>
          <svg {...{ height, width }}>
            <TriangleRightIcon />
          </svg>
        </Box>
      </Box>
    )
  },
  // Inner text of the togglable header menu items
  Header: ({ onSelect, node }) => (
    <Box
      css={{
        display: 'inline-block',
        verticalAlign: 'top',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        padding: '0 $1',
      }}
      onClick={onSelect}
    >
      {node.name}
    </Box>
  ),
  // Main container component for all menu items
  Container,
}
