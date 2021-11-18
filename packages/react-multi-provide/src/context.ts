import { createContext } from "react";
import { ProvidersViewModel } from "./types";

const noop = (..._args: any[]): any => {};

const emptyContext: ProvidersViewModel.ProvidersContextValue = {
  get: noop,
  getCurrent: noop,
  set: noop,
};

export const ProvidersContext =
  createContext<ProvidersViewModel.ProvidersContextValue>(emptyContext);
