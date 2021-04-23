import { Group } from '@visx/group'
import { Bar, Line, LinePath } from '@visx/shape'
import { scaleLinear, scaleBand, scaleTime } from '@visx/scale'
import { AxisLeft, AxisBottom } from '@visx/axis'
import { ProcessedPost } from '../../../hooks/feed/types'
import {
  useTooltip,
  useTooltipInPortal,
  TooltipWithBounds,
} from '@visx/tooltip'
import { localPoint } from '@visx/event'
import { useFeed } from '../../../hooks/feed'
import { useMemo } from 'react'
import { rankPost } from '../../../hooks/feed/ranking'
import { Badge, Box } from '@modulz/design-system'
import { format, formatDistance } from 'date-fns'
import { throttle } from 'lodash'

// Define the graph dimensions and margins
const width = 1000
const height = 500
const margin = { top: 20, bottom: 20, left: 20, right: 20 }

// Then we'll create some bounds
const xMax = width - margin.left - margin.right
const yMax = height - margin.top - margin.bottom

// We'll make some helpers to get at the data we want
const x = (d) => d.x // d.post.id
const y = (d) => d.y // d.score

// Compose together the scale and accessor functions to get point functions
const compose = (scale, accessor) => (data) => scale(accessor(data))

const ms1hrs = 1000 * 60 * 60
const ms4hrs = ms1hrs * 4

const TIME_INCREMENT = ms1hrs
const td = (n) => new Date(new Date().getTime() + n * TIME_INCREMENT)

function generateTimePoints(s, e) {
  let p = []
  for (let i = s; i < e; i++) {
    p.push(td(i))
  }
  return p
}

// Finally we'll embed it all in an SVG
export function Graph(props) {
  const { rankedPosts, keywords, domains } = useFeed()

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
            if (
              Math.abs(value.getTime() - new Date().getTime()) < TIME_INCREMENT
            ) {
              return 'now'
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
                stroke="#333"
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
          stroke={'var(--colors-blue300)'}
          strokeWidth={2}
          pointerEvents="none"
        />
        {tooltipData && (
          <g>
            <Line
              from={{ x: tooltipLeft, y: margin.top }}
              to={{ x: tooltipLeft, y: height + margin.top }}
              stroke={'var(--colors-gray900)'}
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
              fill={'var(--colors-gray900)'}
              stroke="white"
              strokeWidth={2}
              pointerEvents="none"
            />
          </g>
        )}
      </svg>
      {tooltipOpen && selectedData && (
        <TooltipWithBounds
          // set this to random so it correctly updates with parent bounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
        >
          <strong>{selectedData.processedPost.post.content.title}</strong>
          <Badge>{selectedData.score}</Badge>
          <Badge>{format(selectedData.time, 'h:mmaaa')}</Badge>
        </TooltipWithBounds>
      )}
    </Box>
  )
}
