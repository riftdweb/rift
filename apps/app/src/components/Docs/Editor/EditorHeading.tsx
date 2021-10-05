import { Fragment, useState } from 'react'
import {
  Button,
  ControlGroup,
  Flex,
  Heading,
  Tooltip,
} from '@riftdweb/design-system'
import { useDocs } from '@riftdweb/core/src/contexts/docs'
import { RenameDoc } from '../_shared/RenameDoc'
import { DocContextMenu } from '../_shared/BlockContextMenu'
import { Pencil2Icon } from '@radix-ui/react-icons'

export function EditorHeading() {
  const { docId, doc } = useDocs()
  const [isRenaming, setIsRenaming] = useState<boolean>(false)

  if (!docId) {
    return null
  }

  return (
    <Flex
      css={{
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 $2',
      }}
    >
      {isRenaming ? (
        <RenameDoc
          docId={docId}
          name={doc?.name}
          closeEditing={() => setIsRenaming(false)}
        />
      ) : (
        <Fragment>
          <Heading onClick={() => setIsRenaming(true)}>
            {doc?.name || '-'}
          </Heading>
          <ControlGroup>
            <Tooltip content="Rename doc">
              <Button size="2" onClick={() => setIsRenaming(true)}>
                <Pencil2Icon />
              </Button>
            </Tooltip>
            <DocContextMenu docId={docId} variant="gray" size="2" />
          </ControlGroup>
        </Fragment>
      )}
    </Flex>
  )
}
