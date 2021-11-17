import { ProvidersViewModel } from "../src";

export interface Abstract<T> {
  prototype: T;
}

export type ServiceIdentifier<T> = string | symbol | Newable<T> | Abstract<T>;

export interface Newable<T> {
  new (): T;
}

export type Identifier<T = any> =
  | ProvidersViewModel.ContextIdentifier<T>
  | ServiceIdentifier<T>;

export type ToInfer = {
  num: number;
};

export const outerId: Identifier<ToInfer> = Symbol();
