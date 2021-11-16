import { ProvidersViewModel } from "./types";

// this would create TS7053 error, issue is raised at typescript#1863
// const idMap: Record<symbol, ProvidersViewModel.ContextIdentifier<any>> = {};
const idMap: any = {};

export function createId<T>(
  symbol: symbol,
): ProvidersViewModel.ContextIdentifier<T> {
  if (!idMap[symbol]) {
    idMap[symbol] = {
      [Symbol.toStringTag]: () => symbol.toString(),
      toString: () => symbol.toString(),
      valueOf: () => symbol.toString(),
    };
  }
  return idMap[symbol];
}
