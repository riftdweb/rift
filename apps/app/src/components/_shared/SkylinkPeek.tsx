import { Code, Tooltip } from '@riftdweb/design-system'
import { copyToClipboard } from '../../shared/clipboard'

type Props = {
  skylink: string
}

export function SkylinkPeek({ skylink }) {
  return (
    <Tooltip align="start" content="Copy skylink">
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
        onClick={(e) => {
          e.stopPropagation()
          if (skylink) {
            copyToClipboard(skylink, 'skylink')
          }
        }}
      >
        {`${skylink.slice(0, 10)}...`}
      </Code>
    </Tooltip>
  )
}
