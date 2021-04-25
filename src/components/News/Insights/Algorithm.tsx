import { Flex, Box, Text, Subheading } from '@modulz/design-system'
import { MathComponent } from 'mathjax-react'
// function calculateSignal({ p, c, v, r, d }) {
//   return p + c_weight * c + v_weight * v + r_weight * r + d_weight * d + 0.75
// }

// function calculateDecay({ t_c, t_i }) {
//   return 1 / (1 + Math.pow(t_c, 1.8) - Math.pow(t_c - t_i, 1.2))
// }

// p: Number of upvotes
// c: Number of comments
// v: Number of views
// r: Number of relevant keywords
// d: Prioritized web domain
// t_c: Time since initial creation
// t_i: Time since last interactio

export function Algorithm() {
  return (
    <Box>
      <MathComponent
        display={false}
        tex={String.raw`rank = \frac{p + c_w c + v_w v + r_w r + d_w d + b}{1 + t_c^{1.8} - (t_c - t_u)^{1.2}}`}
      />
    </Box>
  )
}
