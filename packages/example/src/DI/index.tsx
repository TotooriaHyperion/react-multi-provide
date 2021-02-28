import React, { memo, useState, useEffect } from "react";
import {
  useContexts,
  useCreateContexts,
  useProvideService,
  useProvide,
  Providers,
  useInit,
} from "react-multi-provide";
import { useChangeDetect, useRenderCount } from "../hooks";
import { IA, IAImpl, IB, IBImpl, IC, ID, IDImpl } from "./services";

export const DependencyInjection = memo(function DependencyInjection() {
  const contexts = useCreateContexts();
  const [v, setV] = useState(0);
  const ic = useInit<IC>(() => ({ c: v }), [v]);
  useProvideService(contexts, IA, IAImpl, []);
  // 带参服务，参数不同实例不同，避免使用
  useProvideService(contexts, IB, IBImpl, [v]);
  useProvideService(contexts, ID, IDImpl, []);
  useProvide(contexts, IC, ic);
  useRenderCount("DependencyInjection");
  // console.log(123);

  const [ib] = useContexts(contexts, IB);

  useChangeDetect({ ic, ib, v }, "DependencyInjection");

  useEffect(() => {
    console.log("test react-refresh");
  }, []);

  return (
    <Providers contexts={contexts}>
      <Child />
      <Child1 />
      <Child2 />
      <Child3 />
      <Child4 />
      <p>IB from same level: {ib.b}</p>
      <button onClick={() => setV((o) => o + 1)}>+</button>
      <button onClick={() => setV((o) => o - 1)}>-</button>
    </Providers>
  );
});

const Child = memo(function Child() {
  const [ia, ib, ic, id] = useContexts(IA, IB, IC, ID);
  useRenderCount("Child");
  useChangeDetect({ ia, ib, ic, id }, "Child");
  return (
    <>
      <p>
        ia, ib, ic, id: {ia.a}, {ib.b}, {ic.c}, {id.d}
      </p>
    </>
  );
});

const Child1 = memo(function Child1() {
  const services = useContexts(IA);
  const [ia] = services;
  useRenderCount("Child1");
  useChangeDetect({ ia, services }, "Child1");
  return <p>ia: {ia.a}</p>;
});
const Child2 = memo(function Child2() {
  const [ib] = useContexts(IB);
  useRenderCount("Child2");
  useChangeDetect({ ib }, "Child2");
  return <p>ib: {ib.b}</p>;
});
const Child3 = memo(function Child3() {
  const [ic] = useContexts([IC]);
  useRenderCount("Child3");
  useChangeDetect({ ic }, "Child3");
  return <p>ic: {ic.c}</p>;
});
const Child4 = memo(function Child3() {
  const [id] = useContexts([ID]);
  useRenderCount("Child4");
  useChangeDetect({ id }, "Child4");
  return <p>ic: {id.d}</p>;
});
