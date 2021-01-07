import { Subscribable } from "rxjs";

export module ProvidersViewModel {
  export interface SubscribableWithInitialValue<T> extends Subscribable<T> {
    getValue: () => T;
  }
  export interface ProvidersContextValue {
    get<T>(id: ContextIdentifier<T>): SubscribableWithInitialValue<T>;
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
  export type ContextIdentifier<T = any> = {
    // 这里是为了方便调试。
    // dummy: T 是为了让 typescript 可以 infer 出 type
    [Symbol.toStringTag]: (dummy?: T) => string;
    toString: () => string;
    valueOf: () => string;
    symbolAs: <ID>() => ID;
  };
  export interface ContextFactory<I, P = unknown> {
    (params: P): I extends ContextIdentifier<infer C> ? C : never;
  }
}
