import { useEffect, useState } from 'react'
import { RxDocument } from 'rxdb'
import { Observable } from 'rxjs'

export function useObservableDoc<T>($: Observable<RxDocument<T, {}>>): T {
  const [state, setState] = useState<T>()

  useEffect(() => {
    const sub = $.subscribe((val) => {
      setState(val.toJSON() as T)
    })
    return () => {
      sub.unsubscribe()
    }
  }, [])

  return state
}
