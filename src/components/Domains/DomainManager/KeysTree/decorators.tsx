import { Flex, Box } from '@modulz/design-system'
import { TriangleRightIcon } from '@radix-ui/react-icons'
import Decorators from 'react-treebeard/dist/components/Decorators'
import React, { useMemo, useState } from 'react'
import { VelocityComponent } from 'velocity-react'
import { DataKeyContextMenu } from '../../../_shared/DataKeyContextMenu'
import { DataKeyFolderContextMenu } from '../../../_shared/DataKeyFolderContextMenu copy'

type ContainerProps = {
  customStyles?: {}
  style: any
  decorators: any
  terminal: boolean
  onClick: () => void
  onSelect?: () => void
  animations: any
  node: any
}

function Container({
  customStyles = {},
  style,
  decorators,
  terminal,
  onClick,
  onSelect = null,
  animations,
  node,
}: ContainerProps) {
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
      {!terminal ? toggleElement : null}
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
        {terminal ? (
          <DataKeyContextMenu
            dataKey={node.key}
            onOpenChange={(val) => {
              setIsMenuOpen(val)
              setIsHovering(val)
            }}
          />
        ) : (
          <DataKeyFolderContextMenu
            dataKey={node.key}
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

export const decorators = {
  ...Decorators,
  Toggle: ({ style, onClick }) => {
    const { height, width } = style

    return (
      <Box style={style.base} onClick={onClick}>
        <Box style={style.wrapper}>
          <svg {...{ height, width }}>
            <TriangleRightIcon />
          </svg>
        </Box>
      </Box>
    )
  },
  Header: ({ onSelect, node, style, customStyles }) => (
    <Box style={style.base} onClick={onSelect}>
      <Box
        style={
          node.selected
            ? { ...style.title, ...customStyles.header.title }
            : style.title
        }
      >
        {node.name}
      </Box>
    </Box>
  ),
  Container,
}
