import { TriangleRightIcon } from '@radix-ui/react-icons'
import { Box } from '@riftdweb/design-system'
import React from 'react'

export function Toggle({ onClick }) {
  return (
    <Box
      onClick={onClick}
      css={{
        display: 'inline-block',
        height: '24px',
        marginLeft: '-5px',
        position: 'relative',
        verticalAlign: 'top',
        width: '15px',
        color: '$gray600',
        '&:hover': {
          color: '$gray900',
        },
      }}
    >
      <Box
        css={{
          height: '14px',
          left: '50%',
          margin: '-7px 0 0 -7px',
          // transform: 'translate(-50%,-50%)',
          position: 'absolute',
          top: '50%',
        }}
      >
        <TriangleRightIcon />
      </Box>
    </Box>
  )
}
