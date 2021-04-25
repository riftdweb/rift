import { Code } from '@modulz/design-system'
import { copyToClipboard } from '../../shared/clipboard'

type Props = {
  skylink: string
}

export function SkylinkPeek({ skylink }) {
  return (
    <Code
      css={{
        padding: '2px',
        fontSize: '12px',
        cursor: 'pointer',
        border: '1px solid $gray400',
        borderRadius: '3px',
        '&:hover': {
          textDecoration: 'underline',
        },
      }}
      onClick={() => skylink && copyToClipboard(skylink, 'skylink')}
    >
      {`${skylink.slice(0, 10)}...`}
    </Code>
  )
}
