import React, { useState, useEffect, useCallback } from "react";
import bytes from "bytes";
import classNames from "classnames";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import path from "path-browserify";
import { useDropzone } from "react-dropzone";
import { UploadFile } from "./UploadFile";
import { Box, Button, Container, Code, ControlGroup, Flex, Paragraph, Radio, RadioGroup, Subheading, Switch, Text } from "@modulz/design-system";
// import "./HomeUpload.scss";
import { parseSkylink } from "skynet-js";
import { useSelectedPortal } from "../../hooks/useSelectedPortal";
import { getSkylinkUrl, uploadDirectory, uploadFile, openFile } from "../../shared/skynet";
import { ArrowDownIcon, CardStackPlusIcon, ContainerIcon } from "@radix-ui/react-icons";

const isValidSkylink = (skylink) => {
  try {
    parseSkylink(skylink); // try to parse the skylink, it will throw on error
  } catch (error) {
    return false;
  }

  return true;
};

const getFilePath = (file) => file.webkitRelativePath || file.path || file.name;

const getRelativeFilePath = (file) => {
  const filePath = getFilePath(file);
  const { root, dir, base } = path.parse(filePath);
  const relative = path.normalize(dir).slice(root.length).split(path.sep).slice(1);

  return path.join(...relative, base);
};

const getRootDirectory = (file) => {
  const filePath = getFilePath(file);
  const { root, dir } = path.parse(filePath);

  return path.normalize(dir).slice(root.length).split(path.sep)[0];
};

const createUploadErrorMessage = (error) => {
  // The request was made and the server responded with a status code that falls out of the range of 2xx
  if (error.response) {
    if (error.response.data.message) {
      return `Upload failed with error: ${error.response.data.message}`;
    }

    const statusCode = error.response.status;
    const statusText = getReasonPhrase(error.response.status);

    return `Upload failed, our server received your request but failed with status code: ${statusCode} ${statusText}`;
  }

  // The request was made but no response was received. The best we can do is detect whether browser is online.
  // This will be triggered mostly if the server is offline or misconfigured and doesn't respond to valid request.
  if (error.request) {
    if (!navigator.onLine) {
      return "You are offline, please connect to the internet and try again";
    }

    // TODO: We should add a note "our team has been notified" and have some kind of notification with this error.
    return "Server failed to respond to your request, please try again later.";
  }

  // TODO: We should add a note "our team has been notified" and have some kind of notification with this error.
  return `Critical error, please refresh the application and try again. ${error.message}`;
};

export function Uploader() {
  const [files, setFiles] = useState([]);
  const [skylink, setSkylink] = useState("");
  const [directoryMode, setDirectoryMode] = useState(false);
  const [selectedPortal] = useSelectedPortal()

  useEffect(() => {
    if (directoryMode) {
      inputRef.current.setAttribute("webkitdirectory", "true");
    } else {
      inputRef.current.removeAttribute("webkitdirectory");
    }
  }, [directoryMode]);

  const handleDrop = async (acceptedFiles) => {
    if (directoryMode && acceptedFiles.length) {
      const rootDir = getRootDirectory(acceptedFiles[0]); // get the file path from the first file

      acceptedFiles = [{ name: rootDir, directory: true, files: acceptedFiles }];
    }

    setFiles((previousFiles) => [...acceptedFiles.map((file) => ({ file, status: "uploading" })), ...previousFiles]);

    const onFileStateChange = (file, state) => {
      setFiles((previousFiles) => {
        const index = previousFiles.findIndex((f) => f.file === file);

        return [
          ...previousFiles.slice(0, index),
          {
            ...previousFiles[index],
            ...state,
          },
          ...previousFiles.slice(index + 1),
        ];
      });
    };

    acceptedFiles.forEach((file) => {
      const onUploadProgress = (progress) => {
        const status = progress === 1 ? "processing" : "uploading";

        onFileStateChange(file, { status, progress });
      };

      // Reject files larger than our hard limit of 1 GB with proper message
      if (file.size > bytes("1 GB")) {
        onFileStateChange(file, { status: "error", error: "This file size exceeds the maximum allowed size of 1 GB." });

        return;
      }

      const upload = async () => {
        try {
          let response;

          if (file.directory) {
            const directory = file.files.reduce((acc, file) => ({ ...acc, [getRelativeFilePath(file)]: file }), {});

            response = await uploadDirectory(selectedPortal, directory, encodeURIComponent(file.name), { onUploadProgress });
          } else {
            response = await uploadFile(selectedPortal, file, { onUploadProgress });
          }

          onFileStateChange(file, { status: "complete", url: getSkylinkUrl(selectedPortal, response.skylink) });
        } catch (error) {
          if (error.response && error.response.status === StatusCodes.TOO_MANY_REQUESTS) {
            onFileStateChange(file, { progress: -1 });

            return new Promise((resolve) => setTimeout(() => resolve(upload()), 3000));
          }

          onFileStateChange(file, { status: "error", error: createUploadErrorMessage(error) });
        }
      };

      upload();
    });
  };

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({ onDrop: handleDrop });

  const handleSkylink = (event) => {
    event.preventDefault();

    // only try to open a valid skylink
    if (isValidSkylink(skylink)) {
      openFile(selectedPortal, skylink);
    }
  };

  const stopPropagation = useCallback((e) => {
    e.stopPropagation()
  }, [])

  const toggleDirectoryModeRadio = useCallback((e) => {
    setDirectoryMode(e.target.value === 'directory')
  }, [setDirectoryMode])

  return (
    <Box>
      <Box className="home-upload-white">
        <Box className="home-upload-split">
          <Box css={{
            border: '1px dashed $gray500',
            borderRadius: '10px',
            overflow: 'hidden',
            cursor: 'pointer',
            ':hover': {
              backgroundColor: '$gray100',
              transition: 'all .1s',
            }
          }}>
            <Flex
              css={{
                borderRadius: '4px',
                height: '200px',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                outline: 'none',
                ':hover': {
                  backgroundcolor: 'rgba(0, 0, 0, 0.03)',
                  cursor: 'pointer'
                },
                ...(isDragActive ? {
                    backgroundColor: '$green500',
                    border: '1px solid $green500',
                  } : {})
              }}
              {...getRootProps()}
            >
              <Subheading>Upload {directoryMode ? "a directory" : "files"}</Subheading>
              <Container size="1">
                <Text size="3" css={{ color: '$gray900', margin: '$1 0 $3', lineHeight: '22px' }}>
                  Drop {directoryMode ? "a directory" : "files"} here or click to browse.
                  Files will be uploaded to <Code>{selectedPortal}</Code>.
                  Files will be pinned according to the portal's policies on retention.
                </Text>
              </Container>
              <Flex css={{ gap: '$3', alignItems: 'center' }}>
                <RadioGroup
                  value={directoryMode ? 'directory' : 'files'}
                  onClick={stopPropagation}
                  onChange={toggleDirectoryModeRadio}
                  defaultValue={directoryMode ? 'directory' : 'files'}>
                  <Flex css={{ gap: '$2' }}>
                    <Flex
                      css={{ gap: '$1' }}
                      onClick={() => setDirectoryMode(false)}>
                      <Text>files</Text>
                      <Radio value="files" />
                    </Flex>
                    <Flex
                      css={{ gap: '$1' }}
                      onClick={() => setDirectoryMode(true)}>
                      <Text>directory</Text>
                      <Radio value="directory" />
                    </Flex>
                  </Flex>
                </RadioGroup>
              </Flex>
            </Flex>
            <input {...getInputProps()} className="offscreen" />
            {directoryMode && (
              <Text>
                Please note that directory upload is not a standard browser feature and the browser support is limited.
                To check whether your browser is compatible, visit{" "}
                <a
                  href="https://caniuse.com/#feat=mdn-api_htmlinputelement_webkitdirectory"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  caniuse.com
                </a>
                .
              </Text>
            )}
          </Box>

          <Box className="home-upload-retrieve">
            <Box className="home-upload-text">
              <h3 id="skylink-retrieve-title">Have a Skylink?</h3>
              <p>Paste the link to retrieve your file</p>

              <form
                className={classNames("home-upload-retrieve-form", { invalid: skylink && !isValidSkylink(skylink) })}
                onSubmit={handleSkylink}
              >
                <input
                  name="skylink"
                  type="text"
                  placeholder="sia://"
                  aria-labelledby="skylink-retrieve-title"
                  onChange={(event) => setSkylink(event.target.value)}
                />
                <button type="submit" aria-label="Retrieve file">
                  <ArrowDownIcon />
                </button>
              </form>
            </Box>
          </Box>
        </Box>

        {files.length > 0 && (
          <Box className="home-uploaded-files">
            {files.map((file, i) => {
              return <UploadFile key={i} {...file} />;
            })}
          </Box>
        )}
      </Box>

      <Text>
        Upon uploading a file, Skynet generates a 46 byte link called a <strong>Skylink</strong>. This link can then be
        shared with anyone to retrieve the file on any Skynet Webportal.
      </Text>
    </Box>
  );
}