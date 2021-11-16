import { Subject } from "rxjs";

export module ProvidersViewModel {
  export interface SubscribableWithInitialValue<T> extends Subject<any> {
    getValue: () => T;
  }
  export interface ProvidersContextValue {
    get<T>(
      id: ContextIdentifier<T>,
      skipWarning?: boolean,
    ): SubscribableWithInitialValue<T>;
    set: <T>(
      id: ContextIdentifier<T>,
      value: SubscribableWithInitialValue<T>,
    ) => void;
  }
  // https://github.com/tc39/proposal-symbols-as-weakmap-keys
  // 这里其实期望Symbol作为WeakMap的key，然而还在stage1
  // 而且与现有Symbol的标准有冲突（比如Symbol.iterator是shared，而Symbol('xxx')往往是unique）
  // 而只有unique symbol才能作为WeakMap的key。所以这个proposal能不能进入标准还不好说。
  // 但这种需求是切实存在的，因此先包一个对象来实现。
  export interface ContextIdentifier<T = any> extends Symbol {}
  export interface ContextFactory<I, P = unknown> {
    (params: P): I extends ContextIdentifier<infer C> ? C : never;
  }
}

export const ObservableServiceSymbol = Symbol.for(
  "react-multi-provide/obs_service",
);
export function isObservableService<T>(
  v: any,
): v is ProvidersViewModel.SubscribableWithInitialValue<T> {
  return !!v?.[ObservableServiceSymbol];
}
