import Link from 'next/link'
import { useRouter } from 'next/router'
import { Box, Flex, TabLink, Text } from '@modulz/design-system'
import { ActivityLogIcon, BarChartIcon, FilePlusIcon, HomeIcon, MixIcon } from '@radix-ui/react-icons';

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
      <Link href="/skyfiles" passHref>
        <TabLink
          active={route.split('/')[1] === 'skyfiles'}>
          <Box css={{ mr: '$1' }}>
            <FilePlusIcon />
          </Box>
          Skyfiles
        </TabLink>
      </Link>
      <Link href="/skydb" passHref>
        <TabLink active={route.split('/')[1] === 'skydb'}>
          <Box css={{ mr: '$1' }}>
            <ActivityLogIcon />
          </Box>
          SkyDB
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
      {/* <Link href="/settings" passHref>
        <TabLink active={route === '/settings'}>
          <Box css={{ mr: '$1' }}>
            <GearIcon />
          </Box>
          Settings
        </TabLink>
      </Link> */}
    </Flex>
  )
}
