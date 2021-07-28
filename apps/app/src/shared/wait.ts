export const wait = (delay: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, delay)
  })
