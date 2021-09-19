import { Flex } from '@riftdweb/design-system'
import { SkeletonRow } from '../_shared/SkeletonRow'

export function EditorSkeleton() {
  return (
    <Flex
      css={{
        padding: '$2 $2',
        fd: 'column',
      }}
    >
      <Flex
        css={{
          fd: 'column',
          gap: '$4',
          mb: '$7',
        }}
      >
        <SkeletonRow variant="title" width="50%" />
        <SkeletonRow variant="heading" width="25%" />
      </Flex>
      <Flex
        css={{
          fd: 'column',
          gap: '$4',
          mb: '$7',
        }}
      >
        <SkeletonRow width="100%" />
        <SkeletonRow width="70%" />
        <SkeletonRow width="65%" />
        <SkeletonRow width="85%" />
        <SkeletonRow width="75%" />
      </Flex>
    </Flex>
  )
}
