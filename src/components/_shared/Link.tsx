import { Box, Button, Link as MLink, Tooltip } from '@modulz/design-system'
import NextLink from 'next/link'

type Props = {
  as?: 'button'
  children: React.ReactNode
  href?: string
  target?: string
  content?: string
  css?: {}
}

export function Link({ as, href, target, children, css, content }: Props) {
  if (as === 'button') {
    if (content) {
      return (
        <NextLink href={href} passHref>
          <Button variant="ghost" css={css} as="a" target={target}>
            <Tooltip content={content}>
              <Box>{children}</Box>
            </Tooltip>
          </Button>
        </NextLink>
      )
    }
    return (
      <NextLink href={href} passHref>
        <Button variant="ghost" css={css} as="a" target={target}>
          {children}
        </Button>
      </NextLink>
    )
  }

  if (content) {
    return (
      <NextLink href={href} passHref>
        <MLink css={css} target={target}>
          <Tooltip content={content}>
            <Box>{children}</Box>
          </Tooltip>
        </MLink>
      </NextLink>
    )
  }

  return (
    <NextLink href={href} passHref>
      <MLink css={css} target={target}>
        {children}
      </MLink>
    </NextLink>
  )
}
