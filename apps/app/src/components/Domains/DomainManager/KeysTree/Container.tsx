import { LockClosedIcon, Pencil2Icon, StackIcon } from '@radix-ui/react-icons'
import { Box, Flex, Tooltip } from '@riftdweb/design-system'
import { useMemo, useState } from 'react'
import { VelocityComponent } from 'velocity-react'
import { useSkynet, SeedIcon } from '@riftdweb/core'
import { ContextMenuDirectory } from '../ContextMenuDirectory'
import { ContextMenuDomain } from '../ContextMenuDomain'
import { ContextMenuFile } from '../ContextMenuFile'
import { ContextMenuStatic } from '../ContextMenuStatic'
import { Header } from './Header'
import { Toggle } from './Toggle'
import {
  TreeNode,
  TreeNodeDirectory,
  TreeNodeFile,
  TreeNodeStatic,
} from './transformKeys'

type Props = {
  // customStyles?: {}
  // style: any
  // decorators: any
  // terminal: boolean
  onClick: () => void
  // onSelect?: () => void
  animations: any
  node: TreeNode
}

export function Container({
  // customStyles = {},
  // style,
  // decorators,
  // terminal,
  onClick,
  // onSelect = null,
  animations,
  node,
}: Props) {
  const { appDomain } = useSkynet()
  const [isHovering, setIsHovering] = useState<boolean>(false)
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const toggleElement = useMemo(() => {
    if (!animations) {
      return <Toggle onClick={onClick} />
    }

    return (
      <VelocityComponent
        animation={animations.toggle.animation}
        duration={animations.toggle.duration}
      >
        <Toggle onClick={onClick} />
      </VelocityComponent>
    )
  }, [animations, onClick])

  const isReadOnly =
    node.domain &&
    !node.domain.seed &&
    ![appDomain].includes(node.domain.dataDomain)

  return (
    <Flex
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => !isMenuOpen && setIsHovering(false)}
      css={{
        height: '35px',
        alignItems: 'center',
        cursor: 'pointer',
        position: 'relative',
        padding: '0px 5px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        '&:hover': { color: '$hiContrast' },
        ...(node.active
          ? {
              background: '$slate700',
              borderRadius: '4px',
              color: '$hiContrast',
            }
          : {}),
      }}
      onClick={onClick}
    >
      <Box>{node.type !== 'file' ? toggleElement : null}</Box>
      <Box>
        {/* {node.type === 'static' && <MarginIcon />} */}
        {node.isRootDomain &&
          (node.domain.seed ? (
            <Tooltip
              align="start"
              content={`Seed domain: ${
                isReadOnly ? 'read-only' : 'read-write'
              }`}
            >
              {!isHovering ? (
                <Box
                  css={{
                    position: 'relative',
                    top: '0px',
                    marginLeft: '5px',
                    marginRight: '-1px',
                  }}
                >
                  {isReadOnly ? <LockClosedIcon /> : <Pencil2Icon />}
                </Box>
              ) : (
                <Box
                  css={{
                    position: 'relative',
                    marginLeft: '7px',
                  }}
                >
                  <SeedIcon />
                </Box>
              )}
            </Tooltip>
          ) : (
            <Tooltip
              align="start"
              content={`MySky data domain: ${
                isReadOnly ? 'read-only' : 'read-write'
              }`}
            >
              {!isHovering ? (
                <Box
                  css={{
                    position: 'relative',
                    top: '0px',
                    marginLeft: '5px',
                    marginRight: '-1px',
                  }}
                >
                  {isReadOnly ? <LockClosedIcon /> : <Pencil2Icon />}
                </Box>
              ) : (
                <Box
                  css={{
                    position: 'relative',
                    top: '2px',
                    marginLeft: '5px',
                    marginRight: '-1px',
                  }}
                >
                  <StackIcon />
                </Box>
              )}
            </Tooltip>
          ))}
      </Box>
      <Header node={node} />
      <Box css={{ flex: 1 }} />
      <Box
        css={{
          visibility: isHovering || isMenuOpen ? 'inherit' : 'hidden',
          width: isHovering || isMenuOpen ? 'inherit' : '0px',
        }}
      >
        {node.type === 'file' && (
          <ContextMenuFile
            treeNode={node as TreeNodeFile}
            onOpenChange={(val) => {
              setIsMenuOpen(val)
              setIsHovering(val)
            }}
          />
        )}
        {node.type === 'directory' && !node.isRootDomain && (
          <ContextMenuDirectory
            treeNode={node as TreeNodeDirectory}
            onOpenChange={(val) => {
              setIsMenuOpen(val)
              setIsHovering(val)
            }}
          />
        )}
        {node.type === 'directory' && node.isRootDomain && (
          <ContextMenuDomain
            treeNode={node as TreeNodeDirectory}
            onOpenChange={(val) => {
              setIsMenuOpen(val)
              setIsHovering(val)
            }}
          />
        )}
        {node.type === 'static' && (
          <ContextMenuStatic
            treeNode={node as TreeNodeStatic}
            onOpenChange={(val) => {
              setIsMenuOpen(val)
              setIsHovering(val)
            }}
          />
        )}
      </Box>
    </Flex>
  )
}
