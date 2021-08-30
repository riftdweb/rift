import { Drop } from './Drop'

type Props = {
  children: React.ReactNode
  directoryPath?: string
  filePath?: string
}

export function Row({ directoryPath, filePath, children }: Props) {
  return (
    <Drop
      directoryPath={directoryPath}
      filePath={filePath}
      css={{
        position: 'relative',
        width: '100%',
        height: '40px',
        borderBottom: '1px solid $gray200',
        'last-of-type': {
          borderBottom: 'none',
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
