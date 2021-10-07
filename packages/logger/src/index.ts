import { format } from 'date-fns'
import chalk from 'chalk'

type LoggerParams = {
  disable?: boolean
  workflowId?: string
}

const isBrowser = typeof self !== 'undefined'

const isLoggerEnabled =
  isBrowser &&
  (process.env.NODE_ENV === 'development' ||
    localStorage?.getItem('isLoggerEnabled'))

export function createLogger(namespace: string, params: LoggerParams = {}) {
  const rootNamespace = namespace
  const fn = (...args: any[]) => {
    if (!isLoggerEnabled) {
      return
    }
    const { disable, workflowId } = params
    if (disable) {
      return
    }
    const time = format(new Date(), 'HH:mm:ss')
    const formattedWorkflowId = workflowId ? workflowId.slice(0, 5) : '-----'

    if (!isBrowser) {
      // nodejs
      console.log(
        `${chalk.hex(getColor(formattedWorkflowId))(
          formattedWorkflowId
        )} ${chalk.blue(`${time} root/${rootNamespace}`)}`,
        // @ts-ignore
        ...args
      )
    } else {
      // browser or web worker
      const metaParts = [
        `%c${formattedWorkflowId} %c${time} root/${rootNamespace}`,
        `color: #${getColor(formattedWorkflowId)}; font-weight: bold;`,
        'color: blue; font-weight: bold;',
      ].filter((i) => !!i)
      // @ts-ignore
      console.log(...metaParts, ...args)
    }
  }
  fn.createLogger = (namespace: string) =>
    createLogger(`${rootNamespace}/${namespace}`)
  return fn
}

export type Logger = ReturnType<typeof createLogger>

function hashCode(str: string) {
  var hash = 0
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return hash
}

function intToRGB(i: number) {
  var c = (i & 0x00ffffff).toString(16).toUpperCase()

  return '00000'.substring(0, 6 - c.length) + c
}

function getColor(workflowId: string) {
  return intToRGB(hashCode(workflowId))
}
