import { useContext, useDebugValue, useEffect, useRef } from "react";
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
  T extends [...ProvidersViewModel.ContextIdentifier[]],
>(
  ...ids: T
): {
  [K in keyof T]: T[K] extends ProvidersViewModel.ContextIdentifier<infer P>
    ? P
    : never;
};
export function useContexts<
  T extends [...ProvidersViewModel.ContextIdentifier[]],
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
  const subscription = useInit<Subscription<any[]>>(() => {
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

function isDepsChanged(a: any[] = [], b: any[] = []): boolean {
  if (!a || !b) {
    return true;
  }
  if (a.length !== b.length) {
    return true;
  }
  if (a.length === 0 && b.length === 0) {
    return false;
  }
  let [left, right] = [a, b];
  if (left.length < right.length) {
    [left, right] = [right, left];
  }
  return left.some((item, idx) => item !== right[idx]);
}

export function useInit<T>(factory: () => T, deps: any[] = []): T {
  const prevDepsRef = useRef<any[]>(null as any);
  const valueRef = useRef<T>(null as any);
  const depsChanged =
    prevDepsRef.current === null || isDepsChanged(prevDepsRef.current, deps);
  if (depsChanged) {
    valueRef.current = factory();
  }
  prevDepsRef.current = deps;
  return valueRef.current;
}

export function useUpdated(handler: () => void, deps?: any[]) {
  const firstEffectRef = useRef(true);
  const changedMark = useInit(() => ({}), deps);
  const prevMarkRef = useRef<any>();
  const depsChanged = prevMarkRef.current !== changedMark;
  prevMarkRef.current = changedMark;
  useEffect(() => {
    if (firstEffectRef.current) {
      firstEffectRef.current = false;
      return;
    }
    if (depsChanged) {
      handler();
    }
  });
}

export const ContextStoreSymbol = Symbol.for(
  "react-multi-provide/context-store",
);
export function useCreateContexts(): ProvidersViewModel.ProvidersContextValue {
  // don't use useMemo to create contexts
  // because react-refresh will abandon useMemo result and create a new contexts
  // react maybe abandon useMemo result in some cases in the future too
  // see https://reactnative.dev/docs/fast-refresh#how-it-works
  // see https://reactjs.org/docs/hooks-reference.html#usememo
  // You may rely on useMemo as a performance optimization, not as a semantic guarantee.
  // In the future, React may choose to “forget” some previously memoized values and recalculate them on next render
  // see https://www.youtube.com/watch?t=484&v=Mjrfb1r3XEM&feature=youtu.be
  const parentContexts = useContext(ProvidersContext);
  const contexts = useInit<ProvidersViewModel.ProvidersContextValue>(() => {
    const store = new Map<ProvidersViewModel.ContextIdentifier, any>();
    return {
      get: (id, skipWarning) => {
        const toInject = store.get(id) || parentContexts.get(id);
        if (!toInject && !skipWarning) {
          console.warn("Identifier:", id, `don't have implementation provided`);
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
  const subject = useInit(() => {
    if (isObservableService<T>(value)) {
      // 如果已经是响应式 service 则直接设置，返回 null 指不需要通过 hooks-effect 触发更新
      contexts.set(id, value);
      return null;
    }
    // 不是响应式 service 说明是通过 hooks 触发的，需要构造一个 Subject
    const box = Object.assign(new Subject(), {
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
      prevValueRef.current = value;
      // 如果非响应式 value 改变，则更新
      ReactDOM.unstable_batchedUpdates(() => {
        subject?.next(new Set([id]));
      });
    }
  }, [value, subject]);
}

export type Pair<T = any> = [ProvidersViewModel.ContextIdentifier<T>, T];

export function useProvideMany(
  contexts: ProvidersViewModel.ProvidersContextValue,
  pairs: Pair[],
) {
  const prev = useRef(pairs);
  useInit(() => {
    pairs.forEach(([id, value]) => {
      if (!contexts.get(id, true)) {
        contexts.set(id, new SubjectWithLatest(value));
      }
    });
  }, [pairs]);
  useEffect(() => {
    ReactDOM.unstable_batchedUpdates(() => {
      if (prev.current !== pairs) {
        const next = new Set(pairs.map((v) => v[0]));
        prev.current.forEach(([id]) => {
          if (!next.has(id)) {
            contexts.get(id, true)?.next(null);
          }
        });
        pairs.forEach(([id, value]) => {
          contexts.get(id, true)?.next(value);
        });
        prev.current = pairs;
      }
    });
  }, [pairs, contexts]);
}

class SubjectWithLatest<T> extends Subject<T> {
  constructor(v: T) {
    super();
    this.value = v;
  }
  value: T;
  next(v: T) {
    this.value = v;
    super.next(v);
  }
  getValue() {
    return this.value;
  }
}

export function useInject<T>(id: ProvidersViewModel.ContextIdentifier<T>): T {
  const contexts = useContext(ProvidersContext);
  const box = contexts.get(id);
  useDebugValue(box, (v) => v.getValue());
  const subscription = useInit<Subscription<T>>(
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
  const subscription = useInit<Subscription<T>>(
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
