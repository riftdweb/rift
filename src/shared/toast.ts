import { toast, TypeOptions } from 'react-toastify'

export const triggerToast = (text: string, type: TypeOptions = 'default') => {
  toast(text, {
    type,
    // position: 'bottom-right',
    position: 'top-center',
    hideProgressBar: true,
    autoClose: 4000,
    // closeOnClick: false,
  })
}
