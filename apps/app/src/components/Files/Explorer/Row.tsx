import { Drop } from './Drop'

type Props = {
  children: React.ReactNode
  dropDisabled?: boolean
  directoryPath?: string
}

export const thumbSize = 20

export function Row({ dropDisabled, directoryPath, children }: Props) {
  return (
    <Drop
      directoryPath={directoryPath}
      disabled={dropDisabled}
      css={{
        position: 'relative',
        width: '100%',
        height: '40px',
        borderBottom: '1px solid $gray3',
        '&:last-of-type': {
          borderBottom: 'none',
          borderBottomLeftRadius: '$3',
          borderBottomRightRadius: '$3',
        },
        '&:hover': {
          backgroundColor: '$gray1',
        },
      }}
    >
      {children}
    </Drop>
  )
}
