import { toast } from 'react-toastify'
import * as clipboard from 'clipboard-polyfill/text'

export const copyToClipboard = (text: string, entity: string) => {
  toast(`Copied ${entity} to clipboard`, {
    position: 'bottom-right',
    hideProgressBar: true,
    autoClose: 5000,
    // closeOnClick: false,
  })
  clipboard.writeText(text)
}
