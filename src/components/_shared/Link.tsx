import { Box, Button, Link as MLink, Tooltip } from '@modulz/design-system'
import { Link as RLink } from 'react-router-dom'

type Props = {
  as?: 'button'
  children: React.ReactNode
  to?: string
  href?: string
  target?: string
  content?: string
  onClick?: () => void
  css?: {}
}

export function Link({
  as,
  to,
  href,
  target,
  children,
  onClick,
  css,
  content,
}: Props) {
  if (as === 'button') {
    if (content) {
      return (
        <Button
          variant="ghost"
          css={css}
          as={RLink}
          to={to}
          href={href}
          onClick={onClick}
          target={target}
        >
          <Tooltip content={content}>
            <Box>{children}</Box>
          </Tooltip>
        </Button>
      )
    }
    return (
      <Button
        variant="ghost"
        css={css}
        as={RLink}
        to={to}
        href={href}
        onClick={onClick}
        target={target}
      >
        {children}
      </Button>
    )
  }

  if (content) {
    return (
      <MLink
        css={css}
        as={RLink}
        to={to}
        href={href}
        onClick={onClick}
        target={target}
      >
        <Tooltip content={content}>
          <Box>{children}</Box>
        </Tooltip>
      </MLink>
    )
  }

  return (
    <MLink
      css={css}
      as={to ? RLink : 'a'}
      to={to}
      href={href}
      onClick={onClick}
      target={target}
    >
      {children}
    </MLink>
  )
}
