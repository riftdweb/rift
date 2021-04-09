import dynamic from 'next/dynamic'

const AppManager = dynamic(() => import('../../components/Home/AppManager'), {
  ssr: false,
})

export default function AppManagerPage() {
  return <AppManager />
}
