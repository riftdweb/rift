type Item = {}

export const mergeItem = <T extends Item>(
  col: T[],
  item: T,
  matchKey: string = 'id'
): T[] => {
  const index = col.findIndex((f) => f[matchKey] === item[matchKey])

  if (!~index) {
    return col
  }

  return [
    ...col.slice(0, index),
    {
      ...col[index],
      ...item,
    },
    ...col.slice(index + 1),
  ]
}

export const upsertItem = <T extends Item>(
  col: T[],
  item: T,
  matchKey: string = 'id'
): T[] => {
  const index = col.findIndex((f) => f[matchKey] === item[matchKey])

  if (!~index) {
    return col.concat(item)
  }

  return [
    ...col.slice(0, index),
    {
      ...col[index],
      ...item,
    },
    ...col.slice(index + 1),
  ]
}
