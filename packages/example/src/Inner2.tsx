import React from "react";
import { useContexts, useReplaySubject } from "react-multi-provide";
import { useChangeDetect, useRenderCount } from "./hooks";
import { ServiceA } from "./service";

export const Inner2: React.FC = () => {
  const [serviceA] = useContexts([ServiceA.id]);
  const {
    state$,
    actions: { inc, dec },
  } = serviceA;
  const count = useReplaySubject(state$);
  useRenderCount("Inner2");
  useChangeDetect({ serviceA, count }, "Inner2");
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
