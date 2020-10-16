import { useContext, useDebugValue, useEffect, useMemo } from "react";
import { BehaviorSubject, combineLatest, Subscribable } from "rxjs";
import { Subscription, useSubscription } from "use-subscription";
import { ProvidersContext } from "./context";
import { ProvidersViewModel } from "./types";

type ID<T> = ProvidersViewModel.ContextIdentifier<T>;

export function useContexts<T1>(sources: [ID<T1>]): [T1];
export function useContexts<T1, T2>(sources: [ID<T1>, ID<T2>]): [T1, T2];
export function useContexts<T1, T2, T3>(
  sources: [ID<T1>, ID<T2>, ID<T3>],
): [T1, T2, T3];
export function useContexts<T1, T2, T3, T4>(
  sources: [ID<T1>, ID<T2>, ID<T3>, ID<T4>],
): [T1, T2, T3, T4];
export function useContexts<T>(ids: ID<T>[]): T[] {
  const contexts = useContext(ProvidersContext);
  const obs = useMemo(() => combineLatest(ids.map((id) => contexts.get(id))), [
    ...ids,
    contexts,
  ]);
  const values = useReplaySubject(obs)!;
  useDebugValue(values);
  return values;
}

export function useCreateContexts(): ProvidersViewModel.ProvidersContextValue {
  const store = useMemo<ProvidersViewModel.ProvidersContextValue>(
    () => new WeakMap<ProvidersViewModel.ContextIdentifier, any>(),
    [],
  );
  useDebugValue(store);
  return store;
}

export function useProvide<T>(
  contexts: ProvidersViewModel.ProvidersContextValue,
  id: ProvidersViewModel.ContextIdentifier<T>,
  value: T,
) {
  const subject = useMemo(() => {
    const box = new BehaviorSubject<T>(value);
    contexts.set(id, box);
    return box;
  }, []);
  useEffect(() => {
    subject.next(value);
  }, [value, subject]);
}

export function useInject<T>(id: ProvidersViewModel.ContextIdentifier<T>): T {
  const contexts = useContext(ProvidersContext);
  const box = contexts.get(id);
  useDebugValue(box, (v) => v.getValue());
  const subscription = useMemo<Subscription<T>>(
    () => ({
      subscribe: (cb) => {
        const sub = box.subscribe(cb);
        return () => sub.unsubscribe();
      },
      getCurrentValue: () => box.getValue(),
    }),
    [box],
  );
  return useSubscription(subscription);
}

export function useReplaySubject<T>(replayed: Subscribable<T>): T | undefined {
  const subscription = useMemo<Subscription<T>>(
    () => ({
      subscribe: (cb) => {
        const sub = replayed.subscribe(cb);
        return () => sub.unsubscribe();
      },
      getCurrentValue: () => {
        let currentValue: T = undefined as any;
        replayed
          .subscribe((value) => {
            currentValue = value;
          })
          .unsubscribe();
        return currentValue;
      },
    }),
    [replayed],
  );
  return useSubscription<T>(subscription);
}
