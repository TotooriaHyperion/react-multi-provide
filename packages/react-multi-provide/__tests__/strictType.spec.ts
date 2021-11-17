import {
  useContexts,
  useCreateContexts,
  useProvide,
  useProvideMany,
  useProvideService,
} from "../src";
import { Identifier, ToInfer } from "./inferType.type";

const id: Identifier<ToInfer> = Symbol("");

class CC {}
class DD implements ToInfer {
  num: 1;
}

test("strict type", () => {
  const ctx = useCreateContexts();
  useProvide(ctx, id, {
    num: 1,
  });
  // @ts-expect-error
  useProvide(ctx, id, {});

  useProvideMany(ctx, [[id, { num: 1 }]]);
  // @ts-expect-error
  useProvideMany(ctx, [[id, {}]]);

  useProvideService(ctx, id, DD, []);
  // @ts-expect-error
  useProvideService(ctx, id, CC, []);

  const [d1] = useContexts(id);
  d1.num;
  const [d2] = useContexts([id]);
  d2.num;
  const [d3] = useContexts(ctx, id);
  d3.num;
});
