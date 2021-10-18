import { useSkynet } from '../skynet'
import { useDropzone } from 'react-dropzone'
import { handleUploads } from '../../services/files'

export function useDrop(directoryPath: string) {
  const { controlRef: ref } = useSkynet()

  const onDrop = async (droppedFiles, _, e) => {
    handleUploads(ref, directoryPath, droppedFiles)
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
