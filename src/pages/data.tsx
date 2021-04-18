import dynamic from 'next/dynamic'

const DomainManager = dynamic(
  () => import('../components/Domains/DomainManager'),
  {
    ssr: false,
  }
)

export default function DomainsListPage() {
  return <DomainManager />
}
