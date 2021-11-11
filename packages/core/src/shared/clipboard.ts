import * as clipboard from 'clipboard-polyfill/text'
import { ToastContent, ToastOptions, TypeOptions } from 'react-toastify'
import { triggerToast, triggerToastCustom } from './toast'

export const copyToClipboard = (
  text: string,
  entity: string,
  type: TypeOptions = 'default'
) => {
  triggerToast(`Copied ${entity} to clipboard`, type)
  clipboard.writeText(text)
}

export const copyToClipboardCustom = (
  text: string,
  message: ToastContent,
  options: ToastOptions
) => {
  triggerToastCustom(message, options)
  clipboard.writeText(text)
}
