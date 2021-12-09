export function setItem(key: string, value: any) {
  const str = JSON.stringify(value)
  localStorage.setItem(key, str)
}

export function getItem(key: string) {
  const str = localStorage.getItem(key)

  if (!str) {
    return undefined
  } else {
    return JSON.parse(str)
  }
}
