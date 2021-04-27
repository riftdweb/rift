import * as clipboard from 'clipboard-polyfill/text'
import { triggerToast } from './toast'

export const copyToClipboard = (text: string, entity: string) => {
  triggerToast(`Copied ${entity} to clipboard`)
  clipboard.writeText(text)
}
