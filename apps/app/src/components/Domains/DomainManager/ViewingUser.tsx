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
import { useFormik } from 'formik'
import { useEffect, useCallback, useRef, useState } from 'react'
import useSWR from 'swr'
import { useSkynet } from '../../../hooks/skynet'
import { useDomainParams } from '../../../hooks/useDomainParams'
import { useSelectedPortal } from '../../../hooks/useSelectedPortal'

type UserAvatar = {
  url: string
}

type Profile = {
  username: string
  aboutMe: string
  avatar: UserAvatar[]
  connections: Object[]
  contact: string
  emailID: string
  firstName: string
  lastName: string
  location: string
  topicsDiscoverable: string[]
  topicsHidden: string[]
}

export function ViewingUser() {
  const [portal] = useSelectedPortal()
  const { Api, userId } = useSkynet()
  const {
    viewingUserId,
    setViewingUserId,
    resetViewingUserId,
  } = useDomainParams()
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const ref = useRef<HTMLInputElement>(null)

  const isViewingMyself = viewingUserId === userId

  const { data } = useSWR<{ data: { profile: Profile } }>(
    viewingUserId,
    () =>
      (Api.getJSON({
        publicKey: viewingUserId,
        dataDomain: 'profile-dac.hns',
        dataKey: 'profileIndex.json',
      }) as unknown) as Promise<{
        data: { profile: Profile }
      }>
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
  let username = profile ? profile.username : viewingUserId
  if (isViewingMyself) {
    // Local seed, no mysky
    if (!username) {
      username = 'local (me)'
    } else {
      username = username + ' (me)'
    }
  }

  const avatarUrl =
    profile && profile.avatar && profile.avatar.length
      ? profile.avatar[0].url
      : null

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
            src={
              avatarUrl
                ? `https://${portal}/${avatarUrl.replace('sia:', '')}`
                : undefined
            }
            onClick={toggleEditing}
            interactive
            css={{
              cursor: 'pointer',
            }}
            alt={userId}
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
          {!isEditing && !isViewingMyself && (
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
