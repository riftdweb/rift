import { Box, Button, Flex, Input, Text } from '@riftdweb/design-system'
import { Fragment, useState } from 'react'
import { useFs } from '../../../contexts/files'
import { Link } from '../../_shared/Link'

export function FileNav() {
  const { activePath, createDirectory } = useFs()
  const [value, setValue] = useState<string>('')

  return (
    <Flex css={{ gap: '$1', alignItems: 'center' }}>
      <Flex css={{ gap: '$1' }}>
        {activePath.map((name, i) => (
          <Fragment>
            {i !== 0 && i < activePath.length && <Text>/</Text>}
            <Link to={`/files/${activePath.slice(0, i + 1).join('/')}`}>
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
  )
}
