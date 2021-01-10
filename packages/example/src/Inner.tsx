import React from "react";
import { useInject, useReplaySubject } from "react-multi-provide";
import { useChangeDetect, useRenderCount } from "./hooks";
import { ServiceA } from "./service";

export const Inner: React.FC = () => {
  const serviceA = useInject(ServiceA.id);
  const {
    state$,
    actions: { inc, dec },
  } = serviceA;
  const count = useReplaySubject(state$);
  useRenderCount("Inner");
  useChangeDetect({ serviceA, count }, "Inner");
  return (
    <>
      <p>{count}</p>
      <div>
        <button onClick={inc}>Increment</button>
        <button onClick={dec}>Decrement</button>
      </div>
    </>
  );
};
