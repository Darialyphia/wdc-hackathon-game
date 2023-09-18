import { makeFunctionReference, type OptionalRestArgs } from 'convex/server';
import type { QueryReference } from './useQuery';
import type { MaybeRefOrGetter } from '@vueuse/core';

export const useSuspenseQuery = <Query extends QueryReference>(
  query: Query,
  args: MaybeRefOrGetter<OptionalRestArgs<Query>>
): Promise<Ref<Query['_returnType']>> => {
  const convex = useConvex();

  const queryReference =
    typeof query === 'string' ? makeFunctionReference<'query', any, any>(query) : query;

  const normalizedArgs = computed(() => toValue(args));

  return new Promise<Ref<Query['_returnType']>>((res, rej) => {
    const data = ref();

    let unsub: () => void;

    const subscribe = () => {
      console.log('subscribe');
      const { onUpdate, localQueryResult } = convex.watchQuery(
        queryReference,
        ...normalizedArgs.value
      );
      const initialValue = localQueryResult();
      data.value = initialValue;

      unsub = onUpdate(() => {
        try {
          const newVal = localQueryResult();
          data.value = newVal;
          res(data);
        } catch (err) {
          rej(err);
        }
      });

      if (initialValue) res(data);
    };

    watch(() => queryReference, subscribe);
    watch(() => JSON.stringify(normalizedArgs.value), subscribe);
    subscribe();

    onUnmounted(() => unsub());
  });
};
