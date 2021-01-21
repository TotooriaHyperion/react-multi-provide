import { ProvidersViewModel } from "../types";

export interface ServiceIdentifier<T = any>
  extends ProvidersViewModel.ContextIdentifier<
    ProvidersViewModel.SubscribableWithInitialValue<T>
  > {}
