import { Feed } from './Feed'
import { Layout } from '../Layout'
import { Controls } from './Controls'

export function Home() {
  return (
    <Layout>
      <Controls />
      <Feed />
    </Layout>
  )
}
