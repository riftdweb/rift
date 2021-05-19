import { Box } from '@riftdweb/design-system'
import { MathComponent } from 'mathjax-react'

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
        tex={String.raw`score = \frac{p + c_w c + v_w v + r_w r + d_w d + b}{1 + t_c^{1.9} - (t_c - t_u)^{1.3}}`}
      />
    </Box>
  )
}
