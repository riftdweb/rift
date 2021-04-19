import { Box, Flex, Heading, Text } from '@modulz/design-system'
import { useHistory } from 'react-router-dom'
import { useCallback } from 'react'
import { useDomains } from '../../../hooks/domains'
import { App } from '../../../shared/types'
import { Link } from '../../_shared/Link'
// import { AddApp } from './AddApp'

type Props = {
  app?: App
}

export function Nav({ app }: Props) {
  const history = useHistory()

  const removeAppAndNav = useCallback(() => {
    if (!app) {
      return
    }
    // removeApp(app.id)
    history.push('/')
  }, [app, history])
  // }, [app, removeApp, push])

  return (
    <Heading css={{ my: '$5' }}>
      <Flex css={{ gap: '$1', alignItems: 'center', height: '30px' }}>
        <Link to="/">Apps</Link>
        {app && <Text>/</Text>}
        {app && (
          <Link
            css={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            to={`/apps/${app.id}`}
          >
            {app.name}
          </Link>
        )}
        {!app && <Box css={{ flex: 1 }} />}
        {/* {!app && <AddApp />} */}
        {/* {app && <SeedContextMenu app={app} variant="gray" size="2" />} */}
      </Flex>
    </Heading>
  )
}
