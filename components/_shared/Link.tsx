import { Button, Link as MLink, Tooltip } from '@modulz/design-system'
import NextLink from 'next/link'

type Props = {
  as?: 'button'
  children: React.ReactNode
  href?: string
  content?: string
  css?: {}
}

export function Link({ as, href, children, css, content }: Props) {
  if (as === 'button') {
    if (content) {
      return (
        <NextLink href={href} passHref>
          <Tooltip content={content}>
            <Button css={css}>
              {children}
            </Button>
          </Tooltip>
        </NextLink>
      )

    }
    return (
      <NextLink href={href} passHref>
        <Button css={css}>
          {children}
        </Button>
      </NextLink>
    )
  }

  if (content) {
    return (
      <NextLink href={href} passHref>
        <Tooltip content={content}>
          <MLink css={css}>
            {children}
          </MLink>
        </Tooltip>
      </NextLink>
    )
  }

  return (
    <NextLink href={href} passHref>
      <MLink css={css}>
        {children}
      </MLink>
    </NextLink>
  )
}
