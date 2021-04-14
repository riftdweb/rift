import dynamic from 'next/dynamic'

const Skyfiles = dynamic(() => import('../components/Skyfiles'), {
  ssr: false,
})

export default function SkyfilesPage() {
  return <Skyfiles />
}
