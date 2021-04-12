import { toast } from 'react-toastify'

export const triggerToast = (text: string) => {
  toast(text, {
    // position: 'bottom-right',
    position: 'top-center',
    hideProgressBar: true,
    autoClose: 4000,
    // closeOnClick: false,
  })
}
