import { injectStyle } from 'react-toastify/dist/inject-style'
import { globalCss } from '@riftdweb/design-system'

export const globalNormalizeStyles = globalCss({
  '*, *::before, *::after': {
    boxSizing: 'border-box',
  },

  body: {
    margin: 0,
    fontFamily:
      'Untitled Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale',
  },

  // Necessary for Rift Docs elements, could be moved into that scope
  'p, h1, h2, h3, h4, h5, h6': {
    margin: 0,
  },

  svg: {
    display: 'block',
    verticalAlign: 'middle',
  },
})

export const globalToastStyles = injectStyle

// !important is necessary to override the packages default styles (above)
export const globalToastCustomStyles = globalCss({
  '.Toastify__toast-container--bottom-right': {
    bottom: '20px !important',
    right: '36px !important',
  },

  '.Toastify__toast--default': {
    backgroundColor: '$panel !important',
    border: '1px solid $panel !important',
    minHeight: 'inherit !important',
    /* box-shadow: 0 1px 10px 0 var(--colors-panel), 0 2px 15px 0 var(--colors-panel); */
  },

  '.Toastify__toast--warning': {
    backgroundColor: '$yellow4 !important',
    border: '1px solid $yellow8 !important',
    minHeight: 'inherit !important',
    /* box-shadow: 0 1px 10px 0 var(--colors-panel), 0 2px 15px 0 var(--colors-panel); */
  },

  '.Toastify__toast--error': {
    backgroundColor: '$red10 !important',
    border: '1px solid $panel !important',
    minHeight: 'inherit !important',
    /* box-shadow: 0 1px 10px 0 var(--colors-panel), 0 2px 15px 0 var(--colors-panel); */
  },

  '.Toastify__toast:last-of-type': {
    marginBottom: '0 !important',
  },

  '.Toastify__toast-body': {
    // some reason $ color does not work
    color: 'var(--colors-hiContrast) !important',
    opacity: '0.7 !important',
  },

  '.Toastify__close-button--default': {
    // some reason $ color does not work
    color: 'var(--colors-gray-5) !important',
  },
})
