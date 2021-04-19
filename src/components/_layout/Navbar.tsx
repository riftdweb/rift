import {
  Box,
  Button,
  Container,
  ControlGroup,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Flex,
  Heading,
  Select,
  Tooltip,
} from '@modulz/design-system'
import { PlusIcon, SunIcon, TriangleDownIcon } from '@radix-ui/react-icons'
import { Link as RLink } from 'react-router-dom'
import { useSelectedPortal } from '../../hooks/useSelectedPortal'
import { portals } from '../../shared/portals'
import SkynetIcon from '../_icons/SkynetIcon'
import { Link } from '../_shared/Link'
import { Searchbar } from './Searchbar'
import { IdentityContextMenu } from './IdentityContextMenu'
import { useHistory } from 'react-router-dom'
import { extractDomainForPortal } from 'skynet-js'
import { useCallback } from 'react'

type Props = {
  toggleTheme: () => void
}

export default function Navbar({ toggleTheme }: Props) {
  const history = useHistory()
  const [selectedPortal, setSelectedPortal] = useSelectedPortal()

  const handleChangePortal = useCallback(
    (newPortal: string) => {
      const hostname = window.location.hostname
      const origin = window.location.origin
      setSelectedPortal(newPortal)
      if (hostname === 'localhost') {
        window.location.reload()
      } else {
        //  e.g. ("https://siasky.net", "dac.hns.siasky.net") => "dac.hns"
        const subdomain = extractDomainForPortal(
          `https://${selectedPortal}`,
          hostname
        )
        window.location.href = `https://${subdomain}.${newPortal}`
      }
    },
    [history, setSelectedPortal]
  )

  return (
    <Box css={{ borderBottom: '1px solid $gray200' }}>
      <Container size="3">
        <Flex css={{ py: '$3', alignItems: 'center' }}>
          <Tooltip content="Tools for the decentralized web">
            <Heading
              css={{
                mr: '$3',
                fontWeight: 'bold',
                top: '-1px',
                position: 'relative',
              }}
            >
              <Flex>
                <Link to="/" css={{ textDecoration: 'none' }}>
                  rift
                </Link>
              </Flex>
            </Heading>
          </Tooltip>
          <Searchbar />
          <Flex css={{ gap: '$1', color: '$gray600', position: 'relative' }}>
            <ControlGroup>
              <Link to="/files" as="button" content="Upload files">
                <PlusIcon />
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger as={Button}>
                  <TriangleDownIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    as={RLink}
                    to="/files"
                    css={{ textDecoration: 'none', cursor: 'pointer' }}
                  >
                    Upload files
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    as={RLink}
                    to="/data"
                    css={{ textDecoration: 'none', cursor: 'pointer' }}
                  >
                    Add data domain
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ControlGroup>
            <ControlGroup>
              <Tooltip content="Visit Portal">
                <Button
                  as="a"
                  href={`https://${selectedPortal}`}
                  target="_blank"
                >
                  <SkynetIcon />
                </Button>
              </Tooltip>
              <Tooltip content="Switch Skynet Portals">
                <div>
                  <Select
                    css={{
                      padding: '0 $1',
                      borderRadius: '0 $2 $2 0 !important',
                    }}
                    onChange={(e) => handleChangePortal(e.target.value)}
                    value={selectedPortal}
                  >
                    {portals.map((portal) => (
                      <option key={portal.domain} value={portal.domain}>
                        https://{portal.domain}
                      </option>
                    ))}
                  </Select>
                </div>
              </Tooltip>
            </ControlGroup>
            <Tooltip content="Toggle theme">
              <Button onClick={toggleTheme}>
                <SunIcon />
              </Button>
            </Tooltip>
            <IdentityContextMenu />
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}
