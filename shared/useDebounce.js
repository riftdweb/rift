import { useState, useEffect, useRef } from 'react';
import toPairs from 'lodash/toPairs'

export function useDebounce(value, delay) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      // Set debouncedValue to value (passed in) after the specified delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Return a cleanup function that will be called every time ...
      // ... useEffect is re-called. useEffect will only be re-called ...
      // ... if value changes (see the inputs array below). 
      // This is how we prevent debouncedValue from changing if value is ...
      // ... changed within the delay period. Timeout gets cleared and restarted.
      // To put it in context, if the user is typing within our app's ...
      // ... search box, we don't want the debouncedValue to update until ...
      // ... they've stopped typing for more than 500ms.
      return () => {
        clearTimeout(handler);
      };
    },
    // Only re-call effect if value changes
    // You could also add the "delay" var to inputs array if you ...
    // ... need to be able to change that dynamically.
    [value] 
  );

  return debouncedValue;
}

export function useDebounceMap(valueMap, delay, callback) {
  const ref = useRef({})

  useEffect(
    () => {
      ref.current.valueMap = valueMap
      ref.current.timeoutMap = {}
    }, []
  )

  useEffect(
    () => {
      toPairs(valueMap).forEach(([key, value]) => {
        if (ref.current.valueMap[key] === value) {
          return
        }

        if (ref.current.timeoutMap[key]) {
          clearTimeout(ref.current.timeoutMap[key])
        }

        const handler = setTimeout(() => {
          ref.current.valueMap[key] = value
          ref.current.timeoutMap[key] = undefined
          callback(key)
        }, delay);

        ref.current.timeoutMap[key] = handler
      })
    },
    [valueMap] 
  );

  return ref.current;
}
