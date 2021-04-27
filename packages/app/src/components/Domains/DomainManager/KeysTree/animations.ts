const DURATION = 100

export default {
  toggle: ({ node: { toggled } }, duration = DURATION) => ({
    animation: { rotateZ: toggled ? 90 : 0 },
    duration: duration,
  }),
  drawer: (/* props */) => ({
    enter: {
      animation: 'slideDown',
      duration: DURATION,
    },
    leave: {
      animation: 'slideUp',
      duration: DURATION,
    },
  }),
}
