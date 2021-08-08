import {
  Container,
  Box,
  Button,
  Flex,
  Input,
  Text,
} from '@riftdweb/design-system'
import { Fragment, useState } from 'react'
import { useFs } from '../../contexts/files'
import { Link } from '../_shared/Link'

const movieSkylink = 'CACLrXkiMMlbTYkuBuD_tqizkqrDJjDIg5dEBGDegMLeQg'

export function FileViewer() {
  const {
    directoryIndex,
    createDirectory,
    setActiveDirectory,
    activeDirectory,
  } = useFs()
  const [value, setValue] = useState<string>('')
  console.log(directoryIndex.data)

  return (
    <Container size="3" css={{ py: '$5' }}>
      <Flex css={{ gap: '$1', alignItems: 'center' }}>
        <Flex css={{ gap: '$1' }}>
          {activeDirectory.map((name, i) => (
            <Fragment>
              {i !== 0 && i < activeDirectory.length && <Text>/</Text>}
              <Link
                to={`/files/${activeDirectory.slice(0, i + 1).join('/')}`}
                onClick={() =>
                  setActiveDirectory(activeDirectory.slice(0, i + 1))
                }
              >
                {name}
              </Link>
            </Fragment>
          ))}
        </Flex>
        <Box css={{ flex: 1 }} />
        <Box>
          <Input onChange={(e) => setValue(e.target.value)} value={value} />
        </Box>
        <Button onClick={() => createDirectory(value)}>Add</Button>
      </Flex>
      <Box
        css={{
          margin: '$3 0',
          border: '1px solid $gray500',
          backgroundColor: '$panel',
          borderRadius: '$3',
          overflow: 'hidden',
        }}
      >
        <Box as="video" controls autoPlay css={{ width: '100%' }}>
          <source src="https://skyportal.xyz/hns/bbb-movie" type="video/mp4" />
        </Box>
      </Box>
    </Container>
  )
}
