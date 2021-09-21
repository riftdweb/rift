import { Flex } from '@riftdweb/design-system'
import { SkeletonRow } from '../_shared/SkeletonRow'

export function DocsMenuSkeleton() {
  return (
    <Flex
      css={{
        fd: 'column',
        gap: '$2',
        margin: '0 $3 $7 $3',
      }}
    >
      <SkeletonRow width="60%" />
      <SkeletonRow width="70%" />
      <SkeletonRow width="50%" />
      <SkeletonRow width="65%" />
      <SkeletonRow width="55%" />
    </Flex>
  )
}
