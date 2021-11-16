import { ProvidersViewModel } from "./types";

export function createId<T>(
  symbol: symbol,
): ProvidersViewModel.ContextIdentifier<T> {
  return symbol;
}
