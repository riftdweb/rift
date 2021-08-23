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
  Select,
  Tooltip,
} from '@riftdweb/design-system'
import { useCallback } from 'react'
import { Link as RLink } from 'react-router-dom'
import { DATA_MYSKY_BASE_PATH } from '../../hooks/path'
import { useSkynet } from '../../contexts/skynet'
import { useTheme } from '../../contexts/theme'
import { usePortal } from '../../hooks/usePortal'
import SkynetIcon from '../_icons/SkynetIcon'
import { Link } from '../_shared/Link'
import { IdentityContextMenu } from './IdentityContextMenu'
import { Searchbar } from './Searchbar'
import { useSearch } from '../../contexts/search'
import LogoIcon from '../_icons/LogoIcon'

export default function Navbar() {
  const { toggleTheme } = useTheme()
  const { portal, portals, setDevPortal } = usePortal()
  const { appDomain } = useSkynet()
  const { isFocused: isSearchFocused } = useSearch()

  const handleChangePortal = useCallback(
    (newPortal: string) => {
      const hostname = window.location.hostname
      if (hostname === 'localhost') {
        setDevPortal(newPortal)
        window.location.reload()
      } else {
        window.location.href = `https://${appDomain}.${newPortal}`
      }
    },
    [appDomain, setDevPortal]
  )

  return (
    <Box css={{ borderBottom: '1px solid $gray200' }}>
      <Container size="4">
        <Flex css={{ py: '$3', alignItems: 'center', gap: '$1' }}>
          <Box
            css={{
              display: 'none',
              '@bp1': {
                display: isSearchFocused ? 'none' : 'block',
              },
              '@bp2': {
                display: 'block',
              },
            }}
          >
            <Tooltip
              align="start"
              content="Rift - Your decentralized workspace"
            >
              <Heading
                css={{
                  mr: '$2',
                  fontWeight: 'bold',
                  top: '-2px',
                  '@bp2': {
                    top: '-2px',
                  },
                  position: 'relative',
                }}
              >
                <Link to="/" css={{ textDecoration: 'none' }}>
                  <Flex css={{ gap: '8px', alignItems: 'center' }}>
                    <LogoIcon />
                  </Flex>
                </Link>
              </Heading>
            </Tooltip>
          </Box>
          <Box
            css={{
              flex: 1,
            }}
          >
            <Searchbar />
          </Box>
          <Box
            css={{
              display: isSearchFocused ? 'none' : 'block',
              '@bp2': {
                display: 'block',
              },
            }}
          >
            <Flex css={{ gap: '$1', color: '$gray600', position: 'relative' }}>
              <ControlGroup
                css={{
                  display: 'none',
                  '@bp3': {
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
                  '@bp3': {
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
                        <option
                          key={portal.domain}
                          value={portal.domain}
                          disabled={portal.disabled}
                        >
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
          </Box>
        </Flex>
      </Container>
    </Box>
  )
}
