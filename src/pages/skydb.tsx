import dynamic from 'next/dynamic'

const SeedList = dynamic(() => import('../components/SkyDb/SeedList'), {
  ssr: false,
})

export default function SeedListPage() {
  return <SeedList />
}
