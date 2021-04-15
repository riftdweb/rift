import { Flex, Box, Button, ControlGroup, Input } from '@modulz/design-system'
import { Pencil2Icon } from '@radix-ui/react-icons'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import { useDomains } from '../../../hooks/domains'
import { Domain } from '../../../shared/types'

type Props = {
  domain: Domain
  prefix: string
  closeDialog: () => void
}

export function AddKeyForm({ domain, prefix = '', closeDialog }: Props) {
  const { push } = useRouter()
  const [newKey, setNewKey] = useState<string>()
  const { addKey } = useDomains()

  const saveKey = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()

      if (!newKey) {
        return
      }

      addKey(domain.id, {
        id: newKey,
        key: newKey,
      })

      setNewKey('')

      push(
        `/data/${encodeURIComponent(domain.name)}/${encodeURIComponent(newKey)}`
      )
    },
    [push, domain, newKey, setNewKey, addKey]
  )

  return (
    <form>
      <Flex css={{ flexDirection: 'column', gap: '$2' }}>
        <ControlGroup css={{ margin: '$3 0' }}>
          <Button disabled>
            {prefix}
            {/* {prefix.length > 20
              ? `...${prefix.slice(-20, prefix.length)}`
              : prefix} */}
          </Button>
          <Input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="path.json"
          />
        </ControlGroup>
        <Button onClick={saveKey}>
          <Box
            css={{
              mr: '$1',
            }}
          >
            <Pencil2Icon />
          </Box>
          Add Key
        </Button>
      </Flex>
    </form>
  )
}
