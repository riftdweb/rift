import { styled } from '@modulz/design-system';
import * as RadixScrollArea from '@radix-ui/react-scroll-area';

const { SCROLL_AREA_CSS_PROPS } = RadixScrollArea;
const StyledScrollArea = styled(RadixScrollArea.Root, {
  position: 'relative',
  zIndex: 0,
  maxWidth: '100%',
  maxHeight: '100%',
  '& [data-radix-scroll-area-viewport-position]::-webkit-scrollbar': {
    display: 'none',
  },
});
const StyledViewport = styled(RadixScrollArea.Viewport, {
  zIndex: 1,
  position: 'relative',
});
const StyledScrollbarY = styled(RadixScrollArea.ScrollbarY, {
  zIndex: 2,
  position: 'absolute',
  userSelect: 'none',
  transition: '300ms opacity ease',
  width: 8,
  right: 0,
  top: 0,
  bottom: 0,
});
const StyledScrollTrack = styled(RadixScrollArea.Track, {
  zIndex: -1,
  position: 'relative',
  width: '100%',
  height: '100%',
});
const StyledScrollThumb = styled(RadixScrollArea.Thumb, {
  backgroundColor: 'gainsboro',
  position: 'absolute',
  top: 0,
  left: 0,
  userSelect: 'none',
  borderRadius: 9999,
  willChange: `var(${SCROLL_AREA_CSS_PROPS.scrollbarThumbWillChange})`,
  height: `var(${SCROLL_AREA_CSS_PROPS.scrollbarThumbHeight})`,
  width: `var(${SCROLL_AREA_CSS_PROPS.scrollbarThumbWidth})`,
});


type Props = {
  children: React.ReactNode
}

export const ScrollArea = ({ children }: Props) => (
  <div style={{ height: 250 }}>
    <StyledScrollArea>
      <StyledViewport>
        {children}
      </StyledViewport>
      <StyledScrollbarY>
        <StyledScrollTrack>
          <StyledScrollThumb />
        </StyledScrollTrack>
      </StyledScrollbarY>
    </StyledScrollArea>
  </div>
);
