import { useContext, useDebugValue, useEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import { Subject, merge, Observable } from "rxjs";
import { skip, tap } from "rxjs/operators";
import { Subscription, useSubscription } from "use-subscription";
import isArray from "lodash.isarray";
import { ProvidersContext } from "./context";
import {
  isObservableService,
  ObservableServiceSymbol,
  ProvidersViewModel,
} from "./types";
import { useStableCallback } from "./dependency_injection";

type ID<T> = ProvidersViewModel.ContextIdentifier<T>;

export function useContexts<T1>(sources: [ID<T1>]): [T1];
export function useContexts<T1, T2>(sources: [ID<T1>, ID<T2>]): [T1, T2];
export function useContexts<T1, T2, T3>(
  sources: [ID<T1>, ID<T2>, ID<T3>],
): [T1, T2, T3];
export function useContexts<T1, T2, T3, T4>(
  sources: [ID<T1>, ID<T2>, ID<T3>, ID<T4>],
): [T1, T2, T3, T4];
export function useContexts<
  T extends [...ProvidersViewModel.ContextIdentifier[]]
>(
  ...ids: T
): {
  [K in keyof T]: T[K] extends ProvidersViewModel.ContextIdentifier<infer P>
    ? P
    : never;
};
export function useContexts<
  T extends [...ProvidersViewModel.ContextIdentifier[]]
>(
  contexts: ProvidersViewModel.ProvidersContextValue,
  ...ids: T
): {
  [K in keyof T]: T[K] extends ProvidersViewModel.ContextIdentifier<infer P>
    ? P
    : never;
};
export function useContexts(...ids: any): any {
  const parentContexts = useContext(ProvidersContext);
  let contexts: ProvidersViewModel.ProvidersContextValue = parentContexts;
  const [first, ...rest] = ids;
  let allIds: ProvidersViewModel.ContextIdentifier[] = ids;
  if (first[ContextStoreSymbol]) {
    allIds = rest;
    contexts = first;
  }
  if (isArray(first)) {
    allIds = first;
  }
  const subscription = useMemo<Subscription<any[]>>(() => {
    const obs = allIds.map((id) => contexts.get(id));
    const getValue = () => obs.map((item) => item.getValue());
    let value = getValue();
    return {
      subscribe: (cb) => {
        const sub = merge(...obs)
          .pipe(
            tap(() => {
              value = getValue();
            }),
          )
          .subscribe(cb);
        return () => sub.unsubscribe();
      },
      getCurrentValue: () => {
        return value;
      },
    };
  }, [...allIds, contexts]);
  const values = useSubscription(subscription)!;
  useDebugValue(values);
  return values;
}

export const ContextStoreSymbol = Symbol.for(
  "react-multi-provide/context-store",
);
export function useCreateContexts(): ProvidersViewModel.ProvidersContextValue {
  const parentContexts = useContext(ProvidersContext);
  const contexts: ProvidersViewModel.ProvidersContextValue = useMemo<ProvidersViewModel.ProvidersContextValue>(() => {
    const store = new WeakMap<ProvidersViewModel.ContextIdentifier, any>();
    return {
      get: (id) => {
        const toInject = store.get(id) || parentContexts.get(id);
        if (!toInject) {
          throw new Error(
            `Identifier: ${id} don't have implementation provided`,
          );
        }
        return toInject;
      },
      set: store.set.bind(store),
      [ContextStoreSymbol]: true,
    };
  }, [parentContexts]);
  useDebugValue(contexts);
  return contexts;
}

export function useProvide<T>(
  contexts: ProvidersViewModel.ProvidersContextValue,
  id: ProvidersViewModel.ContextIdentifier<T>,
  value: T | ProvidersViewModel.SubscribableWithInitialValue<T>,
) {
  const prevValueRef = useRef(value);
  const getCurrentValue = useStableCallback(() => value);
  const subject = useMemo(() => {
    if (isObservableService<T>(value)) {
      // 如果已经是响应式 service 则直接设置，返回 null 指不需要通过 hooks-effect 触发更新
      contexts.set(id, value);
      return null;
    }
    // 不是响应式 service 说明是通过 hooks 触发的，需要构造一个 Subject
    const box = Object.assign(new Subject<T>(), {
      getValue: getCurrentValue,
    });
    contexts.set(id, box);
    return Object.assign(box, {
      [ObservableServiceSymbol]: true,
    });
  }, []);
  useEffect(() => {
    if (isObservableService(value)) {
      // 如果已经是响应式 service 则无需手动触发更新
      return;
    }
    if (prevValueRef.current !== value) {
      // 如果非响应式 value 改变，则更新
      ReactDOM.unstable_batchedUpdates(() => {
        subject?.next();
      });
    }
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

export function useReplaySubject<T>(replayed: Observable<T>): T | undefined {
  const subscription = useMemo<Subscription<T>>(
    () => ({
      subscribe: (cb) => {
        const sub = replayed.pipe(skip(1)).subscribe(cb);
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
