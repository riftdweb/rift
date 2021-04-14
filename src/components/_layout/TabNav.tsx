import { Box, Flex, TabLink } from '@modulz/design-system'
import {
  ActivityLogIcon,
  FilePlusIcon,
  GearIcon,
  HomeIcon,
  MixIcon,
} from '@radix-ui/react-icons'
import Link from 'next/link'
import { useRouter } from 'next/router'

export function TabNav() {
  const { pathname: route } = useRouter()
  return (
    <Flex css={{ borderBottom: '1px solid $slate500' }}>
      <Link href="/" passHref>
        <TabLink active={route.split('/')[1] === ''}>
          <Box css={{ mr: '$1' }}>
            <HomeIcon />
          </Box>
          Home
        </TabLink>
      </Link>
      <Link href="/files" passHref>
        <TabLink active={route.split('/')[1] === 'files'}>
          <Box css={{ mr: '$1' }}>
            <FilePlusIcon />
          </Box>
          Files
        </TabLink>
      </Link>
      <Link href="/domains" passHref>
        <TabLink active={route.split('/')[1] === 'domains'}>
          <Box css={{ mr: '$1' }}>
            <ActivityLogIcon />
          </Box>
          Domains
        </TabLink>
      </Link>
      <Link href="/tools" passHref>
        <TabLink active={route.split('/')[1] === 'tools'}>
          <Box css={{ mr: '$1' }}>
            <MixIcon />
          </Box>
          Tools
        </TabLink>
      </Link>
      {/* <Link href="/portals" passHref>
        <TabLink active={route.split('/')[1] === 'portals'}>
          <Box css={{ mr: '$1' }}>
            <BarChartIcon />
          </Box>
          Portals
        </TabLink>
      </Link> */}
      <Link href="/settings" passHref>
        <TabLink active={route.split('/')[1] === 'settings'}>
          <Box css={{ mr: '$1' }}>
            <GearIcon />
          </Box>
          Settings
        </TabLink>
      </Link>
    </Flex>
  )
}
