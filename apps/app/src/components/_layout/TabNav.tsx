import {
  FilePlusIcon,
  GearIcon,
  GlobeIcon,
  HomeIcon,
  MixIcon,
  StackIcon,
} from '@radix-ui/react-icons'
import { Box, Flex, TabLink } from '@riftdweb/design-system'
import { Link, useLocation } from 'react-router-dom'
import { DATA_MYSKY_BASE_PATH } from '../../hooks/path'

export function TabNav() {
  const location = useLocation()
  const { pathname: route } = location
  return (
    <Flex css={{ borderBottom: '1px solid $slate500' }}>
      <TabLink
        as={Link}
        to="/"
        active={['', 'feed', 'users'].includes(route.split('/')[1])}
      >
        <Box css={{ mr: '$1' }}>
          <HomeIcon />
        </Box>
        Home
      </TabLink>
      <TabLink as={Link} to="/files" active={route.split('/')[1] === 'files'}>
        <Box css={{ mr: '$1' }}>
          <FilePlusIcon />
        </Box>
        Files
      </TabLink>
      <TabLink
        as={Link}
        to={DATA_MYSKY_BASE_PATH}
        active={route.split('/')[1] === 'data'}
      >
        <Box css={{ mr: '$1' }}>
          <StackIcon />
        </Box>
        Data
      </TabLink>
      <TabLink as={Link} to="/dns" active={route.split('/')[1] === 'dns'}>
        <Box css={{ mr: '$1' }}>
          <GlobeIcon />
        </Box>
        DNS
      </TabLink>
      {/* <TabLink as={Link} to="/tools" active={route.split('/')[1] === 'tools'}>
        <Box css={{ mr: '$1' }}>
          <MixIcon />
        </Box>
        Tools
      </TabLink> */}
      <TabLink
        as={Link}
        to="/ecosystem"
        active={route.split('/')[1] === 'ecosystem'}
      >
        <Box css={{ mr: '$1' }}>
          <MixIcon />
        </Box>
        Ecosystem
      </TabLink>
      <TabLink
        as={Link}
        to="/settings"
        active={route.split('/')[1] === 'settings'}
      >
        <Box css={{ mr: '$1' }}>
          <GearIcon />
        </Box>
        Settings
      </TabLink>
    </Flex>
  )
}
