import { Box, Button, Link as MLink, Tooltip } from '@modulz/design-system'
import { Link as RLink } from 'react-router-dom'

type Props = {
  as?: 'button'
  children: React.ReactNode
  to?: string
  href?: string
  variant?: string
  target?: string
  content?: string
  tooltipAlign?: 'start' | 'end' | 'center'
  onClick?: () => void
  css?: {}
}

export function Link({
  as,
  to,
  href,
  target,
  children,
  tooltipAlign,
  variant = 'ghost',
  onClick,
  css,
  content,
}: Props) {
  let _css: {} = {
    ...css,
    cursor: 'pointer',
  }
  if (as === 'button') {
    if (content) {
      return (
        <Button
          variant={variant as any}
          css={_css}
          as={RLink}
          to={to}
          href={href}
          onClick={onClick}
          target={target}
        >
          <Tooltip content={content} align={tooltipAlign}>
            <Box>{children}</Box>
          </Tooltip>
        </Button>
      )
    }
    return (
      <Button
        variant={variant as any}
        css={_css}
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

  _css = {
    ..._css,
    outline: 'none !important',
  }

  if (content) {
    return (
      <MLink
        css={_css}
        as={RLink}
        to={to}
        href={href}
        onClick={onClick}
        target={target}
      >
        <Tooltip content={content} align={tooltipAlign}>
          <Box>{children}</Box>
        </Tooltip>
      </MLink>
    )
  }

  return (
    <MLink
      css={_css}
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
