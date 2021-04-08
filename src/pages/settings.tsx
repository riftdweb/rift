import dynamic from 'next/dynamic'

const Settings = dynamic(() => import('../components/Settings'), {
  ssr: false,
})

export default function SettingsPage() {
  return <Settings />
}
