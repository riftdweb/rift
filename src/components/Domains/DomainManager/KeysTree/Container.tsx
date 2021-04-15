import { Flex, Box } from '@modulz/design-system'
import React, { useMemo, useState } from 'react'
import { VelocityComponent } from 'velocity-react'
import { ContextMenuFile } from '../ContextMenuFile'
import { ContextMenuDirectory } from '../ContextMenuDirectory'
import { ContextMenuStatic } from '../ContextMenuStatic'

type Props = {
  customStyles?: {}
  style: any
  decorators: any
  terminal: boolean
  onClick: () => void
  onSelect?: () => void
  animations: any
  node: any
}

export function Container({
  customStyles = {},
  style,
  decorators,
  terminal,
  onClick,
  onSelect = null,
  animations,
  node,
}: Props) {
  const [isHovering, setIsHovering] = useState<boolean>(false)
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const toggleElement = useMemo(() => {
    if (!animations) {
      return <decorators.Toggle style={style.toggle} onClick={onClick} />
    }

    return (
      <VelocityComponent
        animation={animations.toggle.animation}
        duration={animations.toggle.duration}
      >
        <decorators.Toggle style={style.toggle} onClick={onClick} />
      </VelocityComponent>
    )
  }, [animations, style, onClick])

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
              background: '$gray500',
              borderRadius: '4px',
              color: '$hiContrast',
            }
          : {}),
      }}
      onClick={onClick}
    >
      <Box>{node.type === 'directory' ? toggleElement : null}</Box>
      <decorators.Header
        node={node}
        style={style.header}
        customStyles={customStyles}
        // onSelect={onClick}
      />
      <Box css={{ flex: 1 }} />
      <Box
        css={{ visibility: isHovering || isMenuOpen ? 'inherit' : 'hidden' }}
      >
        {node.type === 'file' && (
          <ContextMenuFile
            treeNode={node}
            onOpenChange={(val) => {
              setIsMenuOpen(val)
              setIsHovering(val)
            }}
          />
        )}
        {node.type === 'directory' && (
          <ContextMenuDirectory
            treeNode={node}
            onOpenChange={(val) => {
              setIsMenuOpen(val)
              setIsHovering(val)
            }}
          />
        )}
        {node.type === 'static' && (
          <ContextMenuStatic
            treeNode={node}
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
