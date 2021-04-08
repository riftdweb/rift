import dynamic from 'next/dynamic'

const SeedManager = dynamic(
  () => import('../../../components/SkyDb/SeedManager'),
  {
    ssr: false,
  }
)

export default function SeedManagerPage() {
  return <SeedManager />
}
