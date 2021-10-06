import React from 'react'
import { Grid as MGrid } from '@riftdweb/design-system'

type Props = {
  children: React.ReactNode
}

export function Grid({ children }: Props) {
  return (
    <MGrid
      css={{
        gap: '$3',
        padding: '$3 0 50px',
        gridTemplateColumns: 'repeat(1, 1fr)',
        '@bp1': {
          gridTemplateColumns: 'repeat(2, 1fr)',
        },
        '@bp2': {
          gridTemplateColumns: 'repeat(4, 1fr)',
        },
      }}
    >
      {children}
    </MGrid>
  )
}
