import { Box, Input } from '@riftdweb/design-system'
import { useDrop } from '@riftdweb/core'

type Props = {
  directoryPath?: string
  children: React.ReactNode
  css?: {}
}

export function Drop({ directoryPath, css, children }: Props) {
  const { getRootProps, getInputProps, isDragActive } = useDrop(directoryPath)

  const props = getRootProps()
  const { ref, onDragEnter, onDragLeave, onDragOver, onDrop } = props
  const dropProps = { ref, onDragEnter, onDragLeave, onDragOver, onDrop }

  return (
    <Box css={css} {...(directoryPath ? dropProps : {})}>
      <Box
        css={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          ...(directoryPath && isDragActive
            ? {
                backgroundColor: '$blue200',
              }
            : {}),
        }}
      />
      <Box
        css={{
          zIndex: isDragActive ? 1 : 'inherit',
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: '3px solid transparent',
          borderRadius: '2px',
          ...(directoryPath && isDragActive
            ? {
                border: '3px solid $blue700',
              }
            : {}),
        }}
      />
      {children}
      <Input {...getInputProps()} />
    </Box>
  )
}
