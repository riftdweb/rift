import dynamic from 'next/dynamic'

const DomainList = dynamic(() => import('../components/Domains/DomainList'), {
  ssr: false,
})

export default function DomainsListPage() {
  return <DomainList />
}
