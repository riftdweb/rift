export function createLogger(namespace: string) {
  const fullNamespace = `rift/${namespace}`
  const fn = (...args) =>
    console.log(
      `%c${fullNamespace}`,
      'color: blue; font-weight: bold;',
      ...args
    )
  fn.createLogger = (namespace: string) =>
    createLogger(`${fullNamespace}/${namespace}`)
  return fn
}
