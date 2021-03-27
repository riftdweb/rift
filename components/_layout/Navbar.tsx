import { Flex, Box, Heading, Select, Tooltip, Button, Container, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, ControlGroup } from '@modulz/design-system'
import SkynetIcon from '../_icons/SkynetIcon'
import { portals } from '../../shared/portals'
import { Searchbar } from './Searchbar'
import NLink from 'next/link'
import { Link } from '../_shared/Link'
import { PlusIcon, SunIcon, TriangleDownIcon } from '@radix-ui/react-icons'
import { useSelectedPortal } from '../../hooks/useSelectedPortal'

type Props = {
  toggleTheme: () => void
}

export default function Navbar({ toggleTheme }: Props) {
  const [selectedPortal, setSelectedPortal] = useSelectedPortal()

  return (
    <Box css={{ borderBottom: '1px solid $gray200'}}>
      <Container size="3">
        <Flex css={{ py: '$3', alignItems: 'center' }}>
          <Tooltip content="Tools and services for the decentralized web">
            <Heading css={{ mr: '$3', fontWeight: 'bold' }}>
              <Flex>
                <Link href="/">rift</Link>
              </Flex>
            </Heading>
          </Tooltip>
          <Box css={{ flex: 1 }}>
            {/* <Searchbar /> */}
          </Box>
          <Flex css={{ gap: '$1', color: '$gray600', position: 'relative' }}>
            <ControlGroup>
              <Link href="/skyfiles" as="button" content="Upload files">
                <PlusIcon />
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger as={Button}>
                  <TriangleDownIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <NLink href="/skyfiles" passHref>
                    <DropdownMenuItem as="a" css={{ textDecoration: 'none', cursor: 'pointer' }}>
                      Upload files
                    </DropdownMenuItem>
                  </NLink>
                  <NLink href="/skydb" passHref>
                    <DropdownMenuItem as="a" css={{ textDecoration: 'none', cursor: 'pointer' }}>
                      Add seed
                    </DropdownMenuItem>
                  </NLink>
                </DropdownMenuContent>
              </DropdownMenu>
            </ControlGroup>
            <ControlGroup>
            <Tooltip content="Visit Portal">
              <Button as="a" href={`https://${selectedPortal}`} target="_blank">
                <SkynetIcon />
              </Button>
            </Tooltip>
            <Tooltip content="Switch Skynet Portals">
              <div>
                <Select
                  css={{ padding: '0 $1', borderRadius: '0 $2 $2 0 !important' }}
                  onChange={(e) => setSelectedPortal(e.target.value)}
                  value={selectedPortal}>
                  {portals.map(portal =>
                    <option
                      key={portal.domain}
                      value={portal.domain}>https://{portal.domain}</option>
                  )}
                </Select>
              </div>
            </Tooltip>
            </ControlGroup>
            <Tooltip content="Toggle theme">
              <Button
                onClick={toggleTheme}
              >
                <SunIcon />
              </Button>
            </Tooltip>
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}
