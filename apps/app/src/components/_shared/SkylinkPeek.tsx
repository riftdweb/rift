import { Code, Tooltip } from '@riftdweb/design-system'
import { isSkylinkV2 } from 'skynet-js'
import { copyToClipboard } from '../../shared/clipboard'

type Props = {
  skylink: string
}

export function SkylinkPeek({ skylink }: Props) {
  const plainSkylink = skylink && skylink.replace('sia://', '')
  const isEntryLink = skylink && isSkylinkV2(plainSkylink)
  const content = isEntryLink ? 'Copy entry link' : 'Copy data link'
  return (
    <Tooltip align="start" content={content}>
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
            copyToClipboard(
              plainSkylink,
              isEntryLink ? 'entry link' : 'data link'
            )
          }
        }}
      >
        {skylink ? `${plainSkylink.slice(0, 10)}...` : '-'}
      </Code>
    </Tooltip>
  )
}
