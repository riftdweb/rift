import { format } from 'date-fns'

export function createLogger(namespace: string) {
  const fullNamespace = `rift/${namespace}`
  const fn = (...args) => {
    const time = format(new Date(), 'HH:mm:ss')
    console.log(
      `%c${time} ${fullNamespace}`,
      'color: blue; font-weight: bold;',
      ...args
    )
  }
  fn.createLogger = (namespace: string) =>
    createLogger(`${fullNamespace}/${namespace}`)
  return fn
}
