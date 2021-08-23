import { useState } from 'react'

export function useKey(): [number, () => void] {
  const [key, setKey] = useState<number>(Math.random())
  return [
    key,
    () => {
      setKey(Math.random())
    },
  ]
}
