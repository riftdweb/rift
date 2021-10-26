import { Cross1Icon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  ControlGroup,
  Flex,
  TextField,
  Text,
} from '@riftdweb/design-system'
import { localPoint } from '@visx/event'
import { Group } from '@visx/group'
import { scaleBand, scaleLinear } from '@visx/scale'
import { Bar } from '@visx/shape'
import { TooltipWithBounds, useTooltip } from '@visx/tooltip'
import throttle from 'lodash/throttle'
import { useCallback, useMemo, useState } from 'react'
import { useFeed } from '@riftdweb/core'

const verticalMargin = 120

const getX = (d) => d.stem
const getY = (d) => d.count

type KeywordItem = {
  stem: string
  count: number
}

type Props = {
  width: number
  height: number
}

export function KeywordsGraph({ width, height }: Props) {
  const { keywords, setKeywordValue } = useFeed()

  const [filterValue, setFilterValue] = useState<string>()

  const allData: KeywordItem[] = useMemo(() => {
    return Object.entries(keywords)
      .map(([stem, count]) => ({
        stem,
        count,
      }))
      .sort((a, b) => (a.count > b.count ? 1 : -1))
  }, [keywords])

  const data = useMemo(() => {
    if (!filterValue) {
      return allData
    }
    return allData.filter((keyword) => keyword.stem.includes(filterValue))
  }, [allData, filterValue])

  // bounds
  const xMax = width
  const yMax = height - verticalMargin

  // scales, memoize for performance
  const xScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, xMax],
        round: true,
        domain: data.map(getX),
        padding: 0.4,
      }),
    [xMax, data]
  )
  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        round: true,
        domain: [0, Math.max(...data.map(getY))],
      }),
    [yMax, data]
  )

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
  } = useTooltip()

  const selectedData = tooltipData as KeywordItem | undefined

  const handleReduceScore = useCallback(
    (item: KeywordItem) => {
      setKeywordValue(item.stem, Math.floor(item.count / 2))
    },
    [setKeywordValue]
  )

  const handleBoostScore = useCallback(
    (item: KeywordItem) => {
      setKeywordValue(item.stem, Math.floor(item.count * 2))
    },
    [setKeywordValue]
  )

  const handleMouseMove = useMemo(
    () =>
      throttle((event, data: KeywordItem) => {
        const coords = localPoint(event.target.ownerSVGElement, event)
        showTooltip({
          tooltipLeft: coords.x,
          tooltipTop: coords.y,
          tooltipData: data,
        })
      }, 10),
    [showTooltip]
  )

  return (
    <Box css={{ position: 'relative' }}>
      <ControlGroup css={{ marginBottom: '$2' }}>
        <TextField
          placeholder="Search keywords"
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
        />
        <Button onClick={() => setFilterValue('')}>
          <Cross1Icon />
        </Button>
      </ControlGroup>
      <svg width={width} height={height}>
        <Group left={0}>
          {data.map((d) => {
            const letter = getX(d)
            const barWidth = xScale.bandwidth()
            const barHeight = yMax - (yScale(getY(d)) ?? 0)
            const barX = xScale(letter)
            const barY = yMax - barHeight
            return (
              <Bar
                key={`bar-${letter}`}
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill={
                  selectedData?.stem === d.stem
                    ? 'var(--colors-blue900)'
                    : 'var(--colors-gray900)'
                }
                onClick={() => handleBoostScore(d)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  handleReduceScore(d)
                }}
                onMouseMove={((e) => handleMouseMove(e, d)) as any}
              />
            )
          })}
        </Group>
      </svg>
      {tooltipOpen && selectedData && (
        <TooltipWithBounds
          key={selectedData.stem}
          top={tooltipTop}
          left={tooltipLeft}
        >
          <Flex
            css={{
              position: 'relative',
              flexDirection: 'column',
              gap: '$2',
              width: '400px',
              overflow: 'hidden',
              padding: '$1 0',
            }}
          >
            <Flex
              css={{
                position: 'relative',
                gap: '$2',
                width: '400px',
                overflow: 'hidden',
                padding: '$1 0',
              }}
            >
              <Text css={{ color: '$gray900' }}>
                <Text
                  css={{
                    display: 'inline',
                    color: '$blue900',
                    fontWeight: 600,
                  }}
                >
                  "{selectedData.stem}"
                </Text>
              </Text>
              <Box css={{ flex: 1 }} />
              <Text>
                <Text
                  css={{
                    display: 'inline',
                    color: '$blue900',
                    fontWeight: 600,
                  }}
                >
                  {selectedData.count}
                </Text>
                <Text css={{ display: 'inline', color: '$gray900' }}>
                  {' '}
                  interactions
                </Text>
              </Text>
            </Flex>
            <Box
              css={{
                paddingTop: '$1',
                marginBottom: '$1',
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid',
                borderBottomColor: 'rgba(0,0,0,0.05)',
              }}
            />
            <Flex
              css={{
                position: 'relative',
                gap: '$2',
                width: '400px',
                overflow: 'hidden',
                padding: '$1 0',
              }}
            >
              <Text css={{ color: '$gray900' }}>
                Boost or reduce score factor with right and left click.
              </Text>
            </Flex>
          </Flex>
        </TooltipWithBounds>
      )}
    </Box>
  )
}
