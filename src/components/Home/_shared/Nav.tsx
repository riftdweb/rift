import { Box, Flex, Heading, Text } from '@modulz/design-system'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { useDomains } from '../../../hooks/domains'
import { App } from '../../../shared/types'
import { Link } from '../../_shared/Link'
import { AddApp } from './AddApp'

type Props = {
  app?: App
}

export function Nav({ app }: Props) {
  const { push } = useRouter()

  const removeAppAndNav = useCallback(() => {
    if (!app) {
      return
    }
    // removeApp(app.id)
    push('/')
  }, [app, push])
  // }, [app, removeApp, push])

  return (
    <Heading css={{ my: '$5' }}>
      <Flex css={{ gap: '$1', alignItems: 'center', height: '30px' }}>
        <Link href="/">Apps</Link>
        {app && <Text>/</Text>}
        {app && (
          <Link
            css={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            href={`/apps/${app.id}`}
          >
            {app.name}
          </Link>
        )}
        {!app && <Box css={{ flex: 1 }} />}
        {!app && <AddApp />}
        {/* {app && <SeedContextMenu app={app} variant="gray" size="2" />} */}
      </Flex>
    </Heading>
  )
}
