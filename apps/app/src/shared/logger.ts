import { format } from 'date-fns'

type LoggerParams = {
  disable?: boolean
  workflowId?: string
}

function hashCode(str) {
  var hash = 0
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return hash
}

function intToRGB(i) {
  var c = (i & 0x00ffffff).toString(16).toUpperCase()

  return '00000'.substring(0, 6 - c.length) + c
}

function getColor(workflowId) {
  return intToRGB(hashCode(workflowId))
}

export function createLogger(namespace: string, params: LoggerParams = {}) {
  const rootNamespace = namespace
  const fn = (...args) => {
    const { disable, workflowId } = params
    if (disable) {
      return
    }
    const time = format(new Date(), 'HH:mm:ss')
    const formattedWorkflowId = workflowId ? workflowId.slice(0, 5) : '-----'
    const metaParts = [
      `%c${formattedWorkflowId} %c${time} rift/${rootNamespace}`,
      `color: #${getColor(formattedWorkflowId)}; font-weight: bold;`,
      'color: blue; font-weight: bold;',
    ].filter((i) => !!i)
    console.log(...metaParts, ...args)
  }
  fn.createLogger = (namespace: string) =>
    createLogger(`${rootNamespace}/${namespace}`)
  return fn
}
