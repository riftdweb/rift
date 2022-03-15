import { useObservableState } from 'observable-hooks'
import { getAccount$ } from '../services/account'

export function useAccount() {
  const account = useObservableState(getAccount$())
  console.log('Account', account)
  return (
    account || {
      id: '',
      isReady: false,
      isInitializing: true,
      isReseting: false,
      myUserId: '',
      appDomain: '',
      portal: '',
    }
  )
}
