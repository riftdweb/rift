import * as RadixScrollArea from '@radix-ui/react-scroll-area'
import { styled } from '@riftdweb/design-system'

const SCROLLBAR_SIZE = 8

const StyledScrollArea = styled(RadixScrollArea.Root, {
  width: '100%',
  height: '100%',
})

const StyledViewport = styled(RadixScrollArea.Viewport, {
  width: '100%',
  height: '100%',
  '> div': {
    // Overriding 'table' to fix width issues
    display: 'block !important',
  },
})

const StyledScrollbar = styled(RadixScrollArea.Scrollbar, {
  display: 'flex',
  zIndex: 2,
  padding: 2,
  background: 'rgba(0, 0, 0, 0.3)',
  '&:hover': {
    background: 'rgba(0, 0, 0, 0.5)',
  },
  transition: 'background 160ms ease-out',
  '&[data-orientation="vertical"]': {
    width: SCROLLBAR_SIZE,
  },
  '&[data-orientation="horizontal"]': {
    flexDirection: 'column',
    height: SCROLLBAR_SIZE,
  },
})

const StyledThumb = styled(RadixScrollArea.Thumb, {
  flex: 1,
  background: 'black',
  borderRadius: SCROLLBAR_SIZE,
})

const StyledCorner = styled(RadixScrollArea.Corner, {
  background: 'rgba(0, 0, 0, 0.3)',
})

type Props = {
  children: React.ReactNode
  orientation?: 'vertical' | 'horizontal'
}

export function ScrollArea({ children, orientation = 'vertical' }: Props) {
  return (
    <StyledScrollArea>
      <StyledViewport>{children}</StyledViewport>

      <StyledScrollbar orientation={orientation}>
        <StyledThumb />
      </StyledScrollbar>

      {/* <StyledScrollbar orientation="horizontal">
        <StyledThumb />
      </StyledScrollbar> */}

      <StyledCorner />
    </StyledScrollArea>
  )
}
