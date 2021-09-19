import { Skeleton } from '@riftdweb/design-system'

type Props = {
  variant?: 'text' | 'heading' | 'title'
  width: string
}

export function SkeletonRow({ variant = 'text', width }: Props) {
  return (
    <Skeleton
      variant={variant}
      css={{
        display: 'block',
        height: '15px',
        width,
        borderRadius: '$1',
      }}
    />
  )
}
