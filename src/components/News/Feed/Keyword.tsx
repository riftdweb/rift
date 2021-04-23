import { Text, Box, Input } from '@modulz/design-system'
import { useCallback } from 'react'
import { useFeed } from '../../../hooks/feed'

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

  if (score > 80) {
    intensity = '$blue600'
  } else if (score > 40) {
    intensity = '$blue500'
  } else if (score > 20) {
    intensity = '$blue400'
  } else if (score > 10) {
    intensity = '$blue300'
  } else if (score > 5) {
    intensity = '$blue200'
  } else if (score > 0) {
    intensity = '$blue100'
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
          backgroundColor: intensity || (isHovering ? '$green200' : 'none'),
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
