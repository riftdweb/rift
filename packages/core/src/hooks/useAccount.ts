import { useObservableState } from 'observable-hooks'
import { getAccount } from '../services/account'
import { map } from 'rxjs'
import { IAccount } from '../stores/account'

export function useAccount(): IAccount {
  return useObservableState(getAccount().$.pipe(map((v) => v.toJSON())))
}
