import { Box, Flex, Text } from '@riftdweb/design-system'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { localPoint } from '@visx/event'
import { Group } from '@visx/group'
import { scaleLinear, scaleTime } from '@visx/scale'
import { Line, LinePath } from '@visx/shape'
import { TooltipWithBounds, useTooltip } from '@visx/tooltip'
import { format, formatDistance } from 'date-fns'
import throttle from 'lodash/throttle'
import { useMemo } from 'react'
import { useFeed } from '../../../hooks/feed'
import { rankPost } from '../../../hooks/feed/ranking'
import { ProcessedPost } from '../../../hooks/feed/types'
import { SkylinkPeek } from '../../_shared/SkylinkPeek'
import { PostTime } from '../_shared/PostTime'

const margin = { top: 20, bottom: 20, left: 20, right: 20 }

const x = (d) => d.x // d.post.id
const y = (d) => d.y // d.score

const compose = (scale, accessor) => (data) => scale(accessor(data))

const ms1hr = 1000 * 60 * 60
const TIME_INCREMENT = ms1hr
const td = (n) => new Date(new Date().getTime() + n * TIME_INCREMENT)

function generateTimePoints(s, e) {
  let p = []
  for (let i = s; i < e; i++) {
    p.push(td(i))
  }
  return p
}

type Props = {
  width: number
  height: number
}

export function ScoreGraph({ width, height }: Props) {
  const { rankedPosts, keywords, domains } = useFeed()

  const xMax = width - margin.left - margin.right
  const yMax = height - margin.top - margin.bottom

  const timePoints = useMemo(() => generateTimePoints(-10, 10), [])
  const posts = rankedPosts || []
  const data = useMemo(
    () =>
      posts
        .slice(0, 100)
        .reverse()
        .map((post) => ({
          post,
          data: timePoints
            .map((time) => {
              const processedPost = rankPost({
                post,
                rankTime: time,
                scoreData: { keywords, domains },
              })
              return {
                x: time,
                y: post.post.ts > time ? null : processedPost.score,
              }
            })
            .filter(({ y }) => !!y),
        })),
    [posts]
  )

  // And then scale the graph by our data
  const xScale = useMemo(
    () =>
      scaleTime({
        range: [0, xMax],
        // round: true,
        domain: [timePoints[0], timePoints[timePoints.length - 1]],
        // padding: 0.4,
      }),
    [data]
  )

  const yScale = useMemo(
    () =>
      scaleLinear({
        range: [yMax, 0],
        round: true,
        domain: [
          0,
          data.reduce(
            (acc, series) =>
              Math.max(acc, Math.max(...series.data.map(({ y }) => y))),
            0
          ),
        ],
      }),
    [data]
  )

  const xPoint = compose(xScale, x)
  const yPoint = compose(yScale, y)

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip()

  const selectedData = tooltipData as
    | {
        processedPost: ProcessedPost
        time: Date
        score: number
      }
    | undefined

  const handleMouseMove = useMemo(
    () =>
      throttle((event, series: any) => {
        const coords = localPoint(event.target.ownerSVGElement, event)
        const time = xScale.invert(coords.x)
        const y = yScale(coords.y)
        const scoreCoords = series.data.find(({ x }) => x > time)
        showTooltip({
          tooltipLeft: coords.x,
          tooltipTop: coords.y,
          tooltipData: {
            processedPost: series.post,
            time,
            score: scoreCoords.y,
          },
        })
      }, 10),
    [xScale, yScale]
  )

  return (
    <Box css={{ position: 'relative' }}>
      <svg width={width} height={height}>
        <AxisBottom
          top={yMax}
          tickFormat={(value: Date) => {
            // Closest tick to current time. Don't show a label since there is a
            // blue line shown at the exact current time.
            if (
              Math.abs(value.getTime() - new Date().getTime()) < TIME_INCREMENT
            ) {
              return ''
            }
            return formatDistance(value, new Date(), {
              addSuffix: true,
            })
          }}
          scale={xScale}
          numTicks={width > 520 ? 10 : 5}
        />
        <AxisLeft scale={yScale} />
        {data.map((series, i) => {
          return (
            <Group key={i}>
              <LinePath
                stroke="var(--sx-colors-hiContrast)"
                strokeWidth={2}
                strokeOpacity={0.6}
                shapeRendering="geometricPrecision"
                data={series.data}
                onMouseMove={((e) => handleMouseMove(e, series)) as any}
                // onMouseOut={hideTooltip}
                x={(d) => xPoint(d) ?? 0}
                y={(d) => yPoint(d) ?? 0}
              />
            </Group>
          )
        })}
        <Line
          from={{ x: xScale(new Date()), y: margin.top }}
          to={{ x: xScale(new Date()), y: height - 41 }}
          stroke={'var(--sx-colors-blue300)'}
          strokeWidth={2}
          pointerEvents="none"
        />
        {tooltipData && (
          <g>
            <Line
              from={{ x: tooltipLeft, y: margin.top }}
              to={{ x: tooltipLeft, y: height + margin.top }}
              stroke={'var(--sx-colors-gray900)'}
              strokeWidth={2}
              pointerEvents="none"
              strokeDasharray="5,2"
            />
            <circle
              cx={tooltipLeft}
              cy={tooltipTop + 1}
              r={4}
              fill="black"
              fillOpacity={0.1}
              stroke="black"
              strokeOpacity={0.1}
              strokeWidth={2}
              pointerEvents="none"
            />
            <circle
              cx={tooltipLeft}
              cy={tooltipTop}
              r={4}
              fill={'var(--sx-colors-gray900)'}
              stroke="white"
              strokeWidth={2}
              pointerEvents="none"
            />
          </g>
        )}
      </svg>
      {tooltipOpen && selectedData && (
        <TooltipWithBounds
          key={selectedData.processedPost.post.id}
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
            <Text size="1" css={{ paddingTop: '$2' }}>
              <Text css={{ display: 'inline', color: '$gray900' }}>
                At time{' '}
              </Text>
              <Text
                css={{ display: 'inline', color: '$blue900', fontWeight: 600 }}
              >
                {format(selectedData.time, 'h:mmaaa')}
              </Text>
              <Text css={{ display: 'inline', color: '$gray900' }}>
                {' '}
                current content score is:{' '}
              </Text>
              <Text
                css={{ display: 'inline', color: '$blue900', fontWeight: 600 }}
              >
                {selectedData.score}
              </Text>
            </Text>
            <Box
              css={{
                paddingTop: '$1',
                marginBottom: '$1',
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid',
                borderBottomColor: 'rgba(0,0,0,0.05)',
              }}
            />
            <Text size="2" css={{ fontWeight: '600', color: '$gray900' }}>
              {selectedData.processedPost.post.content.title}
            </Text>
            <Flex css={{ alignItems: 'center', gap: '$1' }}>
              <SkylinkPeek
                skylink={selectedData.processedPost.post.skylink.replace(
                  'sia:',
                  ''
                )}
              />
              <PostTime
                post={selectedData.processedPost.post}
                prefix="posted"
              />
              <Box css={{ flex: 1 }} />
            </Flex>
          </Flex>
        </TooltipWithBounds>
      )}
    </Box>
  )
}
