import { Card, Box, Flex, Text } from '@riftdweb/design-system'
import { NodeCreate } from './NodeCreate'
import { dac, DataDac, Node } from './dac'
import { computed } from 'mobx'
import { observer } from 'mobx-react-lite'

type ListProps = {
  id?: string
  parentId?: string
  dac: DataDac
}

export const List = observer(({ id, parentId, dac }: ListProps) => {
  // const nodes = computed(() => dac.getNodes(parentId)).get()
  const nodes = dac.getNodes(parentId)

  if (!nodes.length) {
    return null
  }

  return (
    <Flex css={{ gap: '$1', flexDirection: 'column' }}>
      {nodes.map((node) => (
        <Card key={node.id} css={{ paddingLeft: parentId ? '$2' : '0' }}>
          <Flex css={{ flexDirection: 'column', gap: '$1' }}>
            <Flex css={{ gap: '$1', alignItems: 'center' }}>
              <Text css={{ color: '$gray700' }}>{node.id.slice(0, 4)}...</Text>
              <Text>{node.data.title}</Text>
              <Box css={{ flex: 1 }} />
              <NodeCreate dac={dac} parentId={node.id} />
            </Flex>
          </Flex>
          <List id={node.id} parentId={node.id} dac={dac} />
        </Card>
      ))}
    </Flex>
  )
})

type Props = {
  dac: DataDac
}

export const Area = observer(({ dac }: Props) => {
  return (
    <Box css={{ padding: '$2 0' }}>
      <NodeCreate dac={dac} />
      <List dac={dac} />
    </Box>
  )
})

export function Graph() {
  return <Area dac={dac} />
}
