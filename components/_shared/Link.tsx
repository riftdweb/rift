import { Link as MLink } from '@modulz/design-system'
import NextLink from 'next/link'

type Props = {
  children: React.ReactNode
  href?: string
  css?: {}
}

export function Link({ href, children, css }: Props) {
  return (
    <NextLink href={href} passHref>
      <MLink css={css}>
        {children}
      </MLink>
    </NextLink>
  )
}
