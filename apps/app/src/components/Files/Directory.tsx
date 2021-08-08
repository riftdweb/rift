import { Box, Flex, Link, Text } from '@riftdweb/design-system'
import { formatDistance } from 'date-fns'
import { DirectoryIndex } from 'fs-dac-library/dist/cjs/skystandards'
import { useMemo } from 'react'
import { Node, useFs } from '../../contexts/files'
import FolderIcon from '../_icons/FolderIcon'
import SpinnerIcon from '../_icons/SpinnerIcon'

type Props = {
  file: Node
}

export function Directory({ file }: Props) {
  const { setActiveDirectory } = useFs()
  const { pending } = file
  const { name, created } = file.data

  const iconElement = useMemo(() => {
    if (pending) {
      return <SpinnerIcon />
    }
    return <FolderIcon />
  }, [pending])

  return (
    <Box
      css={{
        position: 'relative',
        height: '40px',
        borderBottom: '1px solid $gray300',
        '&:last-of-type': {
          borderBottom: 'none',
        },
        '&:hover': {
          backgroundColor: '$gray100',
        },
      }}
    >
      <Flex
        css={{
          width: '100%',
          height: '100%',
          padding: '0 $3',
          position: 'absolute',
          alignItems: 'center',
          gap: '$1',
        }}
      >
        <Box css={{ color: '$gray900' }}>{iconElement}</Box>
        <Box css={{ flex: 2, overflow: 'hidden' }}>
          <Text
            size="3"
            onClick={() => setActiveDirectory((dirs) => dirs.concat([name]))}
            css={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {name}
          </Text>
        </Box>
        <Box
          css={{
            flex: 1,
          }}
        >
          <Text
            css={{
              color: '$gray900',
              textAlign: 'right',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {created &&
              formatDistance(new Date(created), new Date(), {
                addSuffix: true,
              })}
          </Text>
        </Box>
      </Flex>
    </Box>
  )
}
