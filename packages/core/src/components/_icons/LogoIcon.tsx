import { Image, keyframes } from '@riftdweb/design-system'

const spin = keyframes({
  '0%': { transform: 'scale(1.1) rotate(0deg)' },
  '100%': { transform: 'scale(1.1) rotate(360deg)' },
})

export function LogoIcon() {
  return (
    <Image
      src="/logo.svg"
      css={{
        height: '25px',
        position: 'relative',
        top: '2px',
        transition: 'all .2s ease-in-out',
        '&:hover': {
          animationIterationCount: 'infinite',
          animationDuration: '1500ms',
        },
        // @ts-ignore
        animationName: spin,
        animationDuration: '1500ms',
        animationIterationCount: 1,
        animationTimingFunction: 'ease-in-out',
      }}
      alt="Rift"
    />
  )
}
