import { Flex } from '@riftdweb/design-system'

type Props = {
  gap?: string
  children: React.ReactNode
}

export function StickySection({ children, gap }: Props) {
  return (
    <Flex
      css={{
        position: 'sticky',
        top: 0,
        flexDirection: 'column',
        gap: gap || '$3',
        width: '200px',
        height: '100vh',
        overflow: 'hidden',
        pt: '$3',
      }}
    >
      {children}
    </Flex>
  )
}
