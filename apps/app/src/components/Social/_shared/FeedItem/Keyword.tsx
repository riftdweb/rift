import { Box, Text, Tooltip } from '@riftdweb/design-system'
import { useCallback } from 'react'
import { useObservableState } from 'observable-hooks'
import { getKeywords$ } from '@riftdweb/core/src/services/feeds'

const textStyles: any = {
  lineHeight: '25px',
  display: 'inline',
  whiteSpace: 'pre',
}

type Props = {
  value: string
  stem: string
  isHovering?: boolean
}

export function Keyword({ value, stem, isHovering }: Props) {
  const keywords = useObservableState(getKeywords$())
  const score = keywords[stem] ? keywords[stem] : 0

  // TODO: normalize into a min/max value fetched from user count data
  // otherwise everything will eventually be dark green etc
  let intensity = null

  // if (score > 80) {
  //   intensity = '$violet8'
  // } else if (score > 40) {
  //   intensity = '$violet7'
  // } else if (score > 20) {
  //   intensity = '$violet6'
  // } else if (score > 10) {
  //   intensity = '$violet5'
  // } else if (score > 0) {
  if (score > 0) {
    intensity = '$violet8'
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
          backgroundColor: intensity || (isHovering ? '$teal8' : 'none'),
          transition: 'background-color 0.1s ease-out',
        }}
      >
        {value}
        {score > 0 && (
          <Tooltip content={`${score} points`}>
            <Box
              onClick={noop}
              css={{
                position: 'absolute',
                top: '-14px',
                right: '0px',
                borderRadius: '2px',
                padding: '2px 2px 0 2px',
                backgroundColor: intensity || (isHovering ? '$teal8' : 'none'),
              }}
            >
              <Text>{score}</Text>
            </Box>
          </Tooltip>
        )}
      </Text>
    </Text>
  )
}
