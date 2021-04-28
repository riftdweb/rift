import React from 'react'
import { Box } from '@riftdweb/design-system'
import capitalize from 'lodash/capitalize'
import { TreeNode } from './transformKeys'

type Props = {
  // onSelect: () => void
  node: TreeNode
}

// Inner text of the togglable header menu items
export function Header({ node }: Props) {
  return (
    <Box
      css={{
        display: 'inline-block',
        verticalAlign: 'top',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        padding: '0 $1',
      }}
      // onClick={onSelect}
    >
      {node.type === 'static' ? capitalize(node.name) : node.name}
    </Box>
  )
}
