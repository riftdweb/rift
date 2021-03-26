import { Flex, Box, Link, Heading, Select, Tooltip, Button, Container } from '@modulz/design-system'
import SkynetIcon from '../_icons/SkynetIcon'
import { portals } from '../../shared/portals'
import { Searchbar } from './Searchbar'
import { SunIcon } from '@radix-ui/react-icons'
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
            <Tooltip content="Switch Skynet Portals">
              <div>
                <Select
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
            <Tooltip content="Visit Portal">
              <Button as="a" href={`https://${selectedPortal}`} target="__blank">
                <SkynetIcon />
              </Button>
            </Tooltip>
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
