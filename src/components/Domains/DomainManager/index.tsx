import { Box, Subheading, Text } from '@modulz/design-system'
import { useRouter } from 'next/router'
import { AddKeyForm } from './AddKeyForm'
import { KeysWorkspace } from './KeysWorkspace'
import { Nav } from '../_shared/Nav'
import { useDomains } from '../../../hooks/domains'

export default function DomainManager() {
  const { query } = useRouter()
  const domainName = query.domainName as string
  const { domains, isValidating } = useDomains()
  const domain = domains.find((domain) => domain.name === domainName)

  if (!domain && isValidating) {
    return null
  }

  if (!isValidating && !domain) {
    return <Box>404</Box>
  }

  return (
    <Box css={{ py: '$3' }}>
      <Nav domain={domain} />
      <Box>
        <KeysWorkspace domain={domain} />
        {/* {domain.keys.length ? (
          <KeysWorkspace domain={domain} />
        ) : (
          <Box css={{ textAlign: 'center', padding: '$3 0' }}>
            <Subheading css={{ margin: '$2 0' }}>
              Manage and edit data keys
            </Subheading>
            <Text css={{ color: '$gray900' }}>
              Add a data key above to get started! Adding an existing data key
              will bring up the current value.
            </Text>
          </Box>
        )} */}
      </Box>
    </Box>
  )
}
