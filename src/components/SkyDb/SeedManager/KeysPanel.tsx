import {
  Box,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  Text,
} from '@modulz/design-system'
import { useRouter } from 'next/router'
import { Seed } from '../../../shared/types'
import { KeyEditor } from './KeyEditor'

type Props = {
  seed: Seed
}

export function KeysPanel({ seed }: Props) {
  const { name, keys } = seed
  const { push, query } = useRouter()
  const dataKey = query.dataKey as string
  return (
    <Box>
      <Text css={{ margin: '$3 0' }} size="4">
        Data Keys
      </Text>
      <Tabs
        onValueChange={(key) =>
          push(`/skydb/${name}/${encodeURIComponent(key)}`)
        }
        value={dataKey}
        defaultValue={keys.length ? keys[0] : undefined}
        orientation="vertical"
      >
        <TabsList>
          {keys.map((key) => (
            <TabsTab
              css={{
                maxWidth: '300px',
              }}
              key={key}
              value={key}
            >
              <Box
                css={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {key}
              </Box>
            </TabsTab>
          ))}
        </TabsList>
        {keys.map((key) => (
          <TabsPanel key={key} value={key}>
            <KeyEditor seed={seed} dataKey={key} />
          </TabsPanel>
        ))}
      </Tabs>
    </Box>
  )
}
