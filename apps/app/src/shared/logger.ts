import { format } from 'date-fns'

export function createLogger(namespace: string, disable?: boolean) {
  const rootNamespace = namespace
  const fn = (...args) => {
    if (disable) {
      return
    }
    const time = format(new Date(), 'HH:mm:ss')
    console.log(
      `%c${time} rift/${rootNamespace}`,
      'color: blue; font-weight: bold;',
      ...args
    )
  }
  fn.createLogger = (namespace: string) =>
    createLogger(`${rootNamespace}/${namespace}`)
  return fn
}
