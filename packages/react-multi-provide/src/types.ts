import { Subject } from "rxjs";

const typesymbol = Symbol("");

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
  export interface ContextIdentifier<T = any> extends Symbol {
    [typesymbol]?: T;
  }
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
