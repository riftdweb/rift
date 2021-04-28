import React, { useCallback, useRef, useState } from 'react'
import { DragHandler } from './DragHandler'
import { DragSizingData, DragSizingProps, MEvent } from './types'
import {
  getContainerInfo,
  getContainerMeta,
  getHandlerInfo,
  isNil,
  normalizeMEvent,
} from './util'

export const DragSizing: React.FC<DragSizingProps> = (props) => {
  const {
    border,
    onStart,
    onEnd,
    onUpdate,
    onChange,
    id,
    className,
    style,
    handlerClassName,
    handlerStyle: _handlerStyle,
    handlerWidth: _handlerWidth,
    handlerOffset: _handlerOffset,
    handlerZIndex: _handlerZIndex,
    children,
  } = props

  const handlerWidth = isNil(_handlerWidth) ? 16 : (_handlerWidth as number)
  const handlerOffset = (isNil(_handlerOffset)
    ? -handlerWidth / 2
    : _handlerOffset) as number
  const handlerZIndex = (isNil(_handlerZIndex) ? 10 : _handlerZIndex) as number

  const [diffCoord, setDiffCoord] = useState<DragSizingData['diffCoord']>(0)
  const [oldSize, setOldSize] = useState<DragSizingData['oldSize']>(null)
  const oldCoordRef = useRef<DragSizingData['oldCorrd']>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  const containerMeta = getContainerMeta({ border })

  const { style: containerStyle } = getContainerInfo({
    style,
    containerMeta,
    diffCoord,
    oldSize,
  })

  const { dir, style: handlerStyle } = getHandlerInfo({
    border,
    handlerWidth,
    handlerOffset,
    handlerStyle: _handlerStyle,
  })

  const handleStart = useCallback(
    (_e: MEvent) => {
      const e = normalizeMEvent(_e)

      const { wh, xy } = containerMeta
      const el = boxRef.current
      if (!el) return

      const px = window.getComputedStyle(el)[wh] as string

      setDiffCoord(0)
      setOldSize(parseInt(px, 10))
      oldCoordRef.current = e[xy]

      if (onStart) onStart(e)
    },
    [containerMeta, onStart]
  )

  const handleEnd = useCallback(
    (_e: MEvent) => {
      const e = normalizeMEvent(_e)
      if (onEnd) onEnd(e)
    },
    [onEnd, onChange]
  )

  const handleUpdate = useCallback(
    (_e: MEvent) => {
      const e = normalizeMEvent(_e)

      const { xy } = containerMeta
      if (oldCoordRef.current === null) return

      setDiffCoord(e[xy] - oldCoordRef.current)

      if (onUpdate) onUpdate(e)

      // if (onChange) {
      //   onChange({
      //     width: containerStyle.width,
      //     height: containerStyle.height,
      //   })
      // }
    },
    [containerMeta, onUpdate, containerStyle]
  )

  return (
    <div
      ref={boxRef}
      id={id}
      className={className}
      style={{
        position: 'relative',
        ...containerStyle,
      }}
    >
      <DragHandler
        dir={dir}
        className={handlerClassName}
        style={{
          position: 'absolute',
          zIndex: handlerZIndex,
          ...handlerStyle,
        }}
        onStart={handleStart}
        onEnd={handleEnd}
        onUpdate={handleUpdate}
      />
      {children}
    </div>
  )
}
