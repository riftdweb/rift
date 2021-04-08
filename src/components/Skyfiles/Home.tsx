import {
  Box,
  Button,
  ControlGroup,
  Flex,
  Input,
  Text,
  Tooltip,
} from '@modulz/design-system'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Cross2Icon,
} from '@radix-ui/react-icons'
import React, { Fragment, useCallback, useMemo, useState } from 'react'
import { useUploads } from '../../hooks/useUploads'
import { UploadItem } from './UploadItem'
import { Uploader } from './Uploader'

export function Home() {
  const { uploads, addUploads, updateUpload } = useUploads()

  const [limit] = useState<number>(20)
  const [skip, setSkip] = useState<number>(0)
  const [filterValue, _setFilterValue] = useState<string>()

  const setFilterValue = useCallback(
    (value: string) => {
      _setFilterValue(value)
      setSkip(0)
    },
    [_setFilterValue, setSkip]
  )

  const filteredUploads = useMemo(() => {
    if (!filterValue) {
      return uploads
    }
    return uploads.filter((upload) => {
      if (upload.uploadFile) {
        return upload.uploadFile.name.includes(filterValue)
      }
      if (upload.uploadDirectory) {
        return upload.uploadDirectory.name.includes(filterValue)
      }
      return false
    })
  }, [uploads, filterValue])

  const paginatedUploads = useMemo(
    () => filteredUploads.slice(skip, skip + limit),
    [filteredUploads, skip, limit]
  )

  const page = useMemo(() => skip / limit + 1, [skip, limit])

  const completedUploadCount = useMemo(
    () => uploads.filter((upload) => upload.status === 'complete').length,
    [uploads]
  )

  return (
    <Box>
      <Uploader updateUpload={updateUpload} addUploads={addUploads} />

      {uploads.length > 0 && (
        <Fragment>
          <ControlGroup css={{ margin: '$3 0' }}>
            <Button size="2">Filter</Button>
            <Input
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              size="3"
              placeholder="Filter uploads by name"
            />
            {filterValue && (
              <Button
                onClick={() => setFilterValue('')}
                variant="ghost"
                size="2"
              >
                <Cross2Icon />
              </Button>
            )}
          </ControlGroup>
          <Flex css={{ alignItems: 'center', gap: '$1' }}>
            <Text css={{ color: '$gray900' }}>Pages</Text>
            {uploads.length > 0 && (
              <Flex css={{ alignItems: 'center', gap: '$1' }}>
                <Tooltip content="Previous page">
                  <Button
                    disabled={skip === 0}
                    css={{
                      '&:disabled': {
                        boxShadow: 'none',
                      },
                    }}
                    onClick={() => setSkip(Math.max(0, skip - 20))}
                    variant="ghost"
                  >
                    <ChevronLeftIcon />
                  </Button>
                </Tooltip>
                <Tooltip content={`Page ${page}`}>
                  <Text>{page}</Text>
                </Tooltip>
                <Tooltip content="Next page">
                  <Button
                    disabled={skip + 20 >= filteredUploads.length}
                    css={{
                      '&:disabled': {
                        boxShadow: 'none',
                      },
                    }}
                    onClick={() =>
                      setSkip(
                        skip + 20 >= filteredUploads.length ? skip : skip + 20
                      )
                    }
                    variant="ghost"
                  >
                    <ChevronRightIcon />
                  </Button>
                </Tooltip>
              </Flex>
            )}
            <Box css={{ flex: 1 }} />
            <Text css={{ color: '$gray900' }}>
              {filterValue
                ? `${filteredUploads.length} / ${uploads.length} results`
                : completedUploadCount === uploads.length
                ? `${uploads.length} files`
                : `${
                    uploads.filter((upload) => upload.status === 'complete')
                      .length
                  } / ${uploads.length} complete`}
            </Text>
          </Flex>

          <Box
            css={{
              margin: '$3 0',
              border: '1px solid $gray500',
              backgroundColor: '$panel',
              borderRadius: '$3',
              overflow: 'hidden',
            }}
          >
            <Flex
              css={{
                padding: '$2 $3',
                gap: '$1',
                borderBottom: '1px solid $gray300',
                color: '$gray900',
                fontSize: '14px',
                height: '44px',
                alignItems: 'center',
              }}
            >
              <Box css={{ width: '15px' }} />
              <Box css={{ flex: 2 }}>File</Box>
              <Box
                css={{
                  flex: 1,
                  display: 'none',
                  when: {
                    bp1: {
                      display: 'block',
                    },
                  },
                }}
              >
                Skylink
              </Box>
              <Box
                css={{
                  flex: 1,
                  display: 'none',
                  when: {
                    bp1: {
                      display: 'block',
                    },
                  },
                }}
              >
                Size
              </Box>
              <Box
                css={{
                  flex: 1,
                  display: 'none',
                  when: {
                    bp2: {
                      display: 'block',
                    },
                  },
                }}
              >
                Ingress
              </Box>
              <Box css={{ flex: 1, textAlign: 'right' }}>Time</Box>
            </Flex>
            {paginatedUploads.map((upload) => {
              return (
                <UploadItem
                  key={upload.id}
                  upload={upload}
                  setFilterValue={setFilterValue}
                />
              )
            })}
          </Box>
        </Fragment>
      )}
    </Box>
  )
}
