import { useDropzone } from 'react-dropzone'
import { handleUploads } from '../../services/fileUploads'

export function useDrop(directoryPath: string) {
  const onDrop = async (droppedFiles, _, e) => {
    handleUploads(directoryPath, droppedFiles)
  }

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop,
    noDragEventsBubbling: true,
  })

  return {
    getRootProps,
    getInputProps,
    isDragActive,
    inputRef,
  }
}
