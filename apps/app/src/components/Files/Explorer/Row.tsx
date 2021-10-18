import { Drop } from './Drop'

type Props = {
  children: React.ReactNode
  directoryPath?: string
}

export const thumbSize = 20

export function Row({ directoryPath, children }: Props) {
  return (
    <Drop
      directoryPath={directoryPath}
      css={{
        position: 'relative',
        width: '100%',
        height: '40px',
        borderBottom: '1px solid $gray200',
        '&:last-of-type': {
          borderBottom: 'none',
          borderBottomLeftRadius: '$3',
          borderBottomRightRadius: '$3',
        },
        '&:hover': {
          backgroundColor: '$gray100',
        },
      }}
    >
      {children}
    </Drop>
  )
}
