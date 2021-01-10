import React from "react";
import { useContexts, useReplaySubject } from "react-multi-provide";
import { useChangeDetect, useRenderCount } from "./hooks";
import { ServiceA, ServiceB } from "./service";

export const Inner3: React.FC = () => {
  const [serviceA, double$] = useContexts(ServiceA.id, ServiceB.id);
  const {
    state$,
    actions: { inc, dec },
  } = serviceA;
  const count = useReplaySubject(state$);
  const doubled = useReplaySubject(double$);
  useRenderCount("Inner3");
  useChangeDetect({ serviceA, double$, count, doubled }, "Inner3");
  return (
    <>
      <p>
        {count} * 2 = {doubled}
      </p>
      <div>
        <button onClick={inc}>Increment</button>
        <button onClick={dec}>Decrement</button>
      </div>
    </>
  );
};
