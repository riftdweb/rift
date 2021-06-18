import { Box, Input, Text } from '@riftdweb/design-system'
import { useCallback } from 'react'
import { useFeed } from '../../../../hooks/feed'

const textStyles: any = {
  lineHeight: '25px',
  display: 'inline',
  whiteSpace: 'pre',
}

type Props = {
  value: string
  stem: string
  debugMode?: boolean
  isHovering?: boolean
}

export function Keyword({ value, stem, debugMode, isHovering }: Props) {
  const { keywords, setKeywordValue } = useFeed()
  const score = keywords[stem] ? keywords[stem] : 0

  // TODO: normalize into a min/max value fetched from user count data
  // otherwise everything will eventually be dark green etc
  let intensity = null

  // if (score > 80) {
  //   intensity = '$violet700'
  // } else if (score > 40) {
  //   intensity = '$violet600'
  // } else if (score > 20) {
  //   intensity = '$violet500'
  // } else if (score > 10) {
  //   intensity = '$violet400'
  // } else if (score > 0) {
  if (score > 0) {
    intensity = '$violet700'
  }

  const noop = useCallback((e) => {
    e.stopPropagation()
  }, [])

  return (
    <Text css={{ display: 'inline' }}>
      <Text
        css={{
          ...textStyles,
          position: 'relative',
          borderRadius: '2px',
          backgroundColor: intensity || (isHovering ? '$teal700' : 'none'),
          transition: 'background-color 0.2s ease-out',
        }}
      >
        {value}
        {debugMode && (
          <Box
            onClick={noop}
            css={{
              position: 'absolute',
              top: '-25px',
              left: '0px',
              backgroundColor: '$panel',
            }}
          >
            <Input
              type="number"
              css={{
                width: '45px',
              }}
              value={score}
              onChange={(e) => {
                setKeywordValue(stem, Number(e.target.value))
              }}
            />
          </Box>
        )}
      </Text>
    </Text>
  )
}
