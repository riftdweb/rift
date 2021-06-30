import { PlusIcon, SunIcon, TriangleDownIcon } from '@radix-ui/react-icons'
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
  Image,
  Select,
  Tooltip,
} from '@riftdweb/design-system'
import { useCallback } from 'react'
import { Link as RLink } from 'react-router-dom'
import { extractDomainForPortal } from 'skynet-js'
import { DATA_MYSKY_BASE_PATH } from '../../hooks/path'
import { useSelectedPortal } from '../../hooks/useSelectedPortal'
import { portals } from '../../shared/portals'
import SkynetIcon from '../_icons/SkynetIcon'
import { Link } from '../_shared/Link'
import { IdentityContextMenu } from './IdentityContextMenu'
import { Searchbar } from './Searchbar'

type Props = {
  toggleTheme: () => void
}

export default function Navbar({ toggleTheme }: Props) {
  const [portal, setPortal] = useSelectedPortal()

  const handleChangePortal = useCallback(
    (newPortal: string) => {
      const hostname = window.location.hostname
      setPortal(newPortal)
      if (hostname === 'localhost') {
        window.location.reload()
      } else {
        //  e.g. ("https://siasky.net", "dac.hns.siasky.net") => "dac.hns"
        const subdomain = extractDomainForPortal(`https://${portal}`, hostname)
        window.location.href = `https://${subdomain}.${newPortal}`
      }
    },
    [setPortal, portal]
  )

  return (
    <Box css={{ borderBottom: '1px solid $gray200' }}>
      <Container size="3">
        <Flex css={{ py: '$3', alignItems: 'center' }}>
          <Tooltip align="start" content="Your decentralized workspace">
            <Heading
              css={{
                mr: '$2',
                fontWeight: 'bold',
                top: '-5px',
                position: 'relative',
              }}
            >
              <Link to="/" css={{ textDecoration: 'none' }}>
                <Image
                  src="/wordmark.png"
                  css={{ height: '25px' }}
                  alt="Rift"
                />
              </Link>
            </Heading>
          </Tooltip>
          <Box
            css={{
              display: 'none',
              '@bp1': {
                display: 'block',
              },
            }}
          >
            <Searchbar />
          </Box>
          <Box
            css={{
              flex: 1,
            }}
          />
          <Flex css={{ gap: '$1', color: '$gray600', position: 'relative' }}>
            <ControlGroup
              css={{
                display: 'none',
                '@bp1': {
                  display: 'flex',
                },
              }}
            >
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
                    to={DATA_MYSKY_BASE_PATH}
                    css={{ textDecoration: 'none', cursor: 'pointer' }}
                  >
                    Add data domain
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ControlGroup>
            <ControlGroup
              css={{
                display: 'none',
                '@bp1': {
                  display: 'flex',
                },
              }}
            >
              <Tooltip content="Visit Portal">
                <Button as="a" href={`https://${portal}`} target="_blank">
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
                    value={portal}
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
