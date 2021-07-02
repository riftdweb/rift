import { Flex } from '@riftdweb/design-system'

type Props = {
  gap?: string
  width?: string
  css?: {}
  children: React.ReactNode
}

export function StickySection({ children, gap, width, css = {} }: Props) {
  return (
    <Flex
      css={{
        position: 'sticky',
        top: 0,
        flexDirection: 'column',
        gap: gap || '$3',
        width: width || '200px',
        height: '100vh',
        overflow: 'hidden',
        pt: '$2',
        ...css,
      }}
    >
      {children}
    </Flex>
  )
}
