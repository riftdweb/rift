import { toast, ToastContent, ToastOptions, TypeOptions } from 'react-toastify'

export const triggerToast = (
  text: ToastContent,
  type: TypeOptions = 'default'
) => {
  toast(text, {
    type,
    // position: 'bottom-right',
    position: 'top-center',
    hideProgressBar: true,
    autoClose: 4000,
    // closeOnClick: false,
  })
}

export const triggerToastCustom = (
  text: ToastContent,
  options: ToastOptions
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
