import dynamic from 'next/dynamic'

const SkyDbViewSeed = dynamic(
  () => import('../../../components/SkyDb/ViewSeed'),
  {
    ssr: false,
  }
)

export default function SkyDbViewPage() {
  return <SkyDbViewSeed />
}
