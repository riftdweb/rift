import { useObservableState } from 'observable-hooks'
import { getAccount$ } from '../services/account'
import { map } from 'rxjs'

export function useAccount() {
  const account = useObservableState(getAccount$().pipe(map((v) => v.toJSON())))
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
