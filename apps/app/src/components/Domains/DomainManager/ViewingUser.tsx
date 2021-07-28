import { ArrowRightIcon, ResetIcon } from '@radix-ui/react-icons'
import {
  Flex,
  Avatar,
  Button,
  ControlGroup,
  Input,
  Tooltip,
  Box,
} from '@riftdweb/design-system'
import { IUserProfile } from '@skynethub/userprofile-library/dist/types'
import { useFormik } from 'formik'
import { useEffect, useCallback, useRef, useState } from 'react'
import useSWR from 'swr'
import { useSkynet } from '../../../hooks/skynet'
import { useAvatarUrl } from '../../../hooks/useAvatarUrl'
import { useDomainParams } from '../../../hooks/useDomainParams'

export function ViewingUser() {
  const { Api, myUserId } = useSkynet()
  const {
    viewingUserId,
    isViewingSelf,
    setViewingUserId,
    resetViewingUserId,
  } = useDomainParams()
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const ref = useRef<HTMLInputElement>(null)

  const { data } = useSWR(viewingUserId || 'local', () =>
    Api.getJSON<{
      profile: IUserProfile
    }>({
      publicKey: viewingUserId,
      domain: 'profile-dac.hns',
      path: 'profileIndex.json',
      discoverable: true,
    })
  )

  const toggleEditing = useCallback(() => {
    setIsEditing(!isEditing)
  }, [isEditing, setIsEditing])

  useEffect(() => {
    if (isEditing) {
      ref.current.focus()
    }
  }, [isEditing, ref])

  const profile = data?.data?.profile
  // mysky logged in, or viewing user id
  // usename is user id unless profile data loads and exists
  let username = profile ? profile.username : viewingUserId

  if (username && isViewingSelf) {
    username = username + ' (me)'
  }

  // if user is logged out
  if (!username) {
    username = 'local (me)'
  }

  const avatarUrl = useAvatarUrl(profile)

  const onSubmit = useCallback(
    (vals) => {
      if (vals.userId) {
        setViewingUserId(vals.userId)
      }
      setIsEditing(false)
      formik.resetForm()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setViewingUserId, setIsEditing]
  )

  const formik = useFormik({
    initialValues: {
      userId: '',
    },
    onSubmit,
  })

  return (
    <Flex css={{ alignItems: 'center' }}>
      <Tooltip align="start" content="Change user">
        <Box
          css={{
            zIndex: 1,
            borderRadius: '50%',
            border: '1px solid $slate600',
          }}
        >
          <Avatar
            src={avatarUrl}
            onClick={toggleEditing}
            interactive
            css={{
              cursor: 'pointer',
            }}
            alt={myUserId}
            fallback=""
          />
        </Box>
      </Tooltip>
      <Box
        as="form"
        css={{
          flex: 1,
        }}
        onSubmit={isEditing ? formik.handleSubmit : undefined}
      >
        <ControlGroup
          css={{
            padding: '$1 0',
            marginLeft: '-15px',
          }}
        >
          {isEditing ? (
            <Input
              onClick={() => setIsEditing(true)}
              css={{
                paddingLeft: '$4',
              }}
              ref={ref}
              placeholder="user ID, eg: 7811b31ded..."
              name="userId"
              value={formik.values.userId}
              onChange={formik.handleChange}
            />
          ) : (
            <Input
              disabled
              css={{
                paddingLeft: '$4',
                color: '$hiContrast !important',
              }}
              value={username}
            />
          )}
          {isEditing && (
            <Tooltip content="Set user ID">
              <Button onClick={() => formik.handleSubmit()}>
                <ArrowRightIcon />
              </Button>
            </Tooltip>
          )}
          {!isEditing && viewingUserId && !isViewingSelf && (
            <Tooltip content="Reset to your user ID">
              <Button onClick={resetViewingUserId}>
                <ResetIcon />
              </Button>
            </Tooltip>
          )}
        </ControlGroup>
      </Box>
    </Flex>
  )
}
