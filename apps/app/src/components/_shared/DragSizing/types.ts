export type MEvent = MouseEvent | TouchEvent

export type RdsMEvent =
  | MouseEvent
  | (TouchEvent & {
      clientX: number
      clientY: number
    })

export interface DragHandlerProps {
  dir: 'ew' | 'ns'
  onStart: (e: MEvent) => void
  onEnd: (e: MEvent) => void
  onUpdate: (e: MEvent) => void
  className?: string
  style?: React.CSSProperties
}

export interface DragHandlerData {
  listenersRef: {
    handleMouseMove: (e: MEvent) => void
    handleMouseUp: (e: MEvent) => void
  } | null
}

export interface DragSizingProps {
  border: 'top' | 'bottom' | 'left' | 'right'
  onStart?: DragHandlerProps['onStart']
  onEnd?: DragHandlerProps['onEnd']
  onUpdate?: DragHandlerProps['onUpdate']
  id?: string
  className?: string
  style?: React.CSSProperties
  handlerClassName?: string
  handlerStyle?: React.CSSProperties
  handlerWidth?: number
  handlerOffset?: number
  handlerZIndex?: number
}

export interface DragSizingData {
  diffCoord: number
  oldCorrd: number | null
  oldSize: number | null
}
