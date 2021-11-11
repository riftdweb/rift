import { toast, ToastContent, ToastOptions } from 'react-toastify'

export const triggerToast = (
  text: ToastContent,
  options: ToastOptions = {}
) => {
  toast(text, {
    type: 'default',
    // position: 'bottom-right',
    position: 'top-center',
    hideProgressBar: true,
    autoClose: 4000,
    // closeOnClick: false,
    ...options,
  })
}
