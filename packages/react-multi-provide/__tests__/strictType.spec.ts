import {
  useConstructor,
  useContexts,
  useCreateContexts,
  useProvide,
  useProvideMany,
  useProvideService,
} from "../src";
import { Identifier, ToInfer } from "./inferType.type";

const id: Identifier<ToInfer> = Symbol("");

type Type2 = { b: string };
const id2: Identifier<Type2> = Symbol("");

class CC {}
class DD implements ToInfer {
  num: 1;
}

class EE implements Type2 {
  b: string;
}

test("strict type", () => {
  const ctx = useCreateContexts();
  useProvide(ctx, id, {
    num: 1,
  });
  // @ts-expect-error
  useProvide(ctx, id, {});

  useProvideMany(ctx, [
    [id, { num: 1 }],
    [id2, { b: "123" }],
  ]);
  // @ts-expect-error
  useProvideMany(ctx, [[id, {}]]);
  // @ts-expect-error
  useProvideMany(ctx, [[id2, 123]]);

  useProvideService(ctx, id, DD, []);
  useProvideService(ctx, id2, EE, []);
  // @ts-expect-error
  useProvideService(ctx, id, CC, []);
  // @ts-expect-error
  useProvideService(ctx, id2, CC, []);

  const [d1, e1] = useContexts(id, id2);
  d1.num;
  e1.b;
  const [d2, e2] = useContexts([id, id2]);
  d2.num;
  e2.b;
  const [d3, e3] = useContexts(ctx, id, id2);
  d3.num;
  e3.b;

  const e4 = useConstructor(ctx, DD, []);
  e4.num;
});
