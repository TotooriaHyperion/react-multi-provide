import { ProvidersViewModel, useContexts } from "../src";
import { Identifier, outerId, ToInfer } from "./inferType.type";

const id: Identifier<ToInfer> = Symbol("");
const id2: ProvidersViewModel.ContextIdentifier<ToInfer> = Symbol("");

function xxx<T>(id: ProvidersViewModel.ContextIdentifier<T>): T {
  return {} as any;
}

test("inferType", () => {
  const [toInfer1] = useContexts([id]);
  const [toInfer2] = useContexts(id);

  const [toInfer3] = useContexts([outerId]);
  const [toInfer4] = useContexts(outerId);

  const d1 = xxx(id);
  const d2 = xxx(outerId);

  toInfer1.num;
  toInfer2.num;
  toInfer3.num;
  toInfer4.num;
});
