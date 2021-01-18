import { createId } from "../utils";
import { ServiceIdentifier } from "./types";

export function createServiceId<T>(symbol: symbol): ServiceIdentifier<T> {
  return createId(symbol);
}
