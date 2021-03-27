import React, { useState, useRef, useEffect } from "react";
// import "./UploadFile.scss";
import SpinnerIcon from "../_icons/SpinnerIcon";
import { CheckIcon, CopyIcon, Cross2Icon, FileIcon } from "@radix-ui/react-icons";
import { Box, Button, Card, Flex, Subheading, Text } from "@modulz/design-system";

type Props = {
  file: {
    name: string
  }
  status: string
  url?: string
  progress?: number,
  error?: string
}

export function UploadFile({ file, url, status, progress, error }: Props) {
  const [copied, setCopied] = useState(false);
  const urlRef = useRef(null);

  useEffect(() => {
    if (copied) {
      const timeoutId = setTimeout(() => {
        setCopied(false);
      }, 1500);

      return () => clearTimeout(timeoutId);
    }
  }, [copied, setCopied]);

  const getIcon = () => {
    if (status === "uploading" || status === "processing") {
      return <FileIcon />;
    } else if (status === "error") {
      return <Cross2Icon />;
    } else {
      return <CheckIcon />;
    }
  };

  const copyToClipboard = (e) => {
    urlRef.current.select();
    document.execCommand("copy");
    e.target.focus();
    setCopied(true);
  };

  const copyText = copied ? "Copied!" : "Copy to clipboard";
  const getProgressText = (progress) => {
    if (progress === -1) {
      return "Waiting...";
    } else if (progress > 0) {
      return `Uploading ${Math.round(progress * 100)}%`;
    }
    return "Uploading...";
  };

  return (
    <Card>
      <Box className="upload-file-icon">{getIcon()}</Box>
      <Flex className="upload-file-text">
        <Subheading css={{ margin: '$2 0' }}>{file.name}</Subheading>
        <Text css={{ margin: '$2 0' }}>
          {status === "uploading" && getProgressText(progress)}
          {status === "processing" && "Processing..."}
          {status === "error" && <span className="red-text">{error || "Upload failed."}</span>}
          {status === "complete" && (
            <a href={url} className="url green-text" target="_blank" rel="noopener noreferrer">
              {url}
            </a>
          )}
        </Text>
      </Flex>
      {(status === "uploading" || status === "processing") && (
        <Box className="upload-file-loading">
          <SpinnerIcon />
        </Box>
      )}

      {status === "complete" && (
        <Button onClick={copyToClipboard}>
          <p className="upload-file-copy-tooltip">{copyText}</p>
          <div className="upload-file-copy-button">
            Copy Link
            <CopyIcon />
          </div>
          <textarea value={url} ref={urlRef} readOnly={true} />
        </Button>
      )}
    </Card>
  );
}
