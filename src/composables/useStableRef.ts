import type { AnyObject } from '../utils/types';

// return a ref that only triggers when one the specified properties change
export function useStableRef<TObj extends AnyObject, TProps extends (keyof TObj)[]>(
  value: TObj,
  props: TProps
) {
  return customRef((track, trigger) => {
    return {
      get() {
        track();
        return value;
      },
      set(newValue) {
        const oldValue = value;
        value = newValue;
        const shouldTrigger = props.some(p => oldValue[p] !== value[p]);
        if (shouldTrigger) {
          trigger();
        }
      }
    };
  });
}
