import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Cross2Icon,
} from '@radix-ui/react-icons'
import {
  Box,
  Button,
  ControlGroup,
  Flex,
  TextField,
  Text,
  Tooltip,
} from '@riftdweb/design-system'
import React, { Fragment, useCallback, useMemo, useState } from 'react'
import { useSkyfiles } from '@riftdweb/core'
import { SkyfileItem } from './SkyfileItem'
import { Uploader } from './Uploader'

export function Home() {
  const { skyfiles, addSkyfiles, updateSkyfile, updateSkyfileUpload } =
    useSkyfiles()

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

  const filteredSkyfiles = useMemo(() => {
    if (!filterValue) {
      return skyfiles
    }
    return skyfiles.filter((skyfile) => {
      return skyfile.metadata.filename.includes(filterValue)
    })
  }, [skyfiles, filterValue])

  const paginatedSkyfiles = useMemo(
    () => filteredSkyfiles.slice(skip, skip + limit),
    [filteredSkyfiles, skip, limit]
  )

  const page = useMemo(() => skip / limit + 1, [skip, limit])

  const completedUploadCount = useMemo(
    () =>
      skyfiles.filter((skyfile) => skyfile.upload.status === 'complete').length,
    [skyfiles]
  )

  return (
    <Box>
      <Uploader
        updateSkyfile={updateSkyfile}
        updateSkyfileUpload={updateSkyfileUpload}
        areUploadsInProgress={completedUploadCount < skyfiles.length}
        addSkyfiles={addSkyfiles}
      />

      {skyfiles.length > 0 && (
        <Fragment>
          <ControlGroup css={{ margin: '$3 0' }}>
            <Button size="2">Filter</Button>
            <TextField
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              size="2"
              placeholder="Filter files by name"
            />
            {filterValue && (
              <Button onClick={() => setFilterValue('')} ghost size="2">
                <Cross2Icon />
              </Button>
            )}
          </ControlGroup>
          <Flex css={{ alignItems: 'center', gap: '$1' }}>
            <Text css={{ color: '$gray900' }}>Pages</Text>
            {skyfiles.length > 0 && (
              <Flex css={{ alignItems: 'center', gap: '$2' }}>
                <Tooltip content="Previous page">
                  <Button
                    disabled={skip === 0}
                    css={{
                      '&:disabled': {
                        boxShadow: 'none',
                      },
                    }}
                    onClick={() => setSkip(Math.max(0, skip - 20))}
                    ghost
                  >
                    <ChevronLeftIcon />
                  </Button>
                </Tooltip>
                <Tooltip content={`Page ${page}`}>
                  <Text>{page}</Text>
                </Tooltip>
                <Tooltip content="Next page">
                  <Button
                    disabled={skip + 20 >= filteredSkyfiles.length}
                    css={{
                      '&:disabled': {
                        boxShadow: 'none',
                      },
                    }}
                    onClick={() =>
                      setSkip(
                        skip + 20 >= filteredSkyfiles.length ? skip : skip + 20
                      )
                    }
                    ghost
                  >
                    <ChevronRightIcon />
                  </Button>
                </Tooltip>
              </Flex>
            )}
            <Box css={{ flex: 1 }} />
            <Text css={{ color: '$gray900' }}>
              {filterValue
                ? `${filteredSkyfiles.length} results`
                : completedUploadCount === skyfiles.length
                ? `${skyfiles.length} files`
                : `${completedUploadCount} / ${skyfiles.length} complete`}
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
                  '@bp1': {
                    display: 'block',
                  },
                }}
              >
                Skylink
              </Box>
              <Box
                css={{
                  flex: 1,
                  display: 'none',
                  '@bp1': {
                    display: 'block',
                  },
                }}
              >
                Size
              </Box>
              <Box
                css={{
                  flex: 1,
                  display: 'none',
                  '@bp2': {
                    display: 'block',
                  },
                }}
              >
                Ingress
              </Box>
              <Box css={{ flex: 1, textAlign: 'right' }}>Time</Box>
            </Flex>
            {paginatedSkyfiles.map((skyfile) => {
              return (
                <SkyfileItem
                  key={skyfile.id}
                  skyfile={skyfile}
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
