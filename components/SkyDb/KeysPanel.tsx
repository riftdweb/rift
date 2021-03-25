import { Box, Subheading, Tabs, TabsList, TabsPanel, TabsTab, Text } from '@modulz/design-system'
import { KeyEditor } from './KeyEditor'

type Props = {
  seed: string
  keys: string[]
}

export function KeysPanel({ seed, keys }: Props) {
  return (
    <Box>
      <Tabs
        defaultValue={keys.length ? keys[0] : undefined}
        orientation="vertical">
        <TabsList>
          <Text
            css={{ margin: '$3 0' }}
            size="4">Data Keys</Text>
          {keys.map((key) =>
            <TabsTab
              css={{
                maxWidth: '300px',
              }}
              value={key}>
              <Box
                css={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                {key}
              </Box>
            </TabsTab>
          )}
        </TabsList>
        {keys.map((key) =>
          <TabsPanel value={key}>
            <KeyEditor
              seed={seed}
              dataKey={key} />
          </TabsPanel>
        )}
      </Tabs>
    </Box>
  )
}
