import React from "react";
import { useContexts, useReplaySubject } from "../../lib";
import { ServiceA, ServiceB } from "./service";

export const Inner3: React.FC = () => {
  const [
    {
      state$,
      actions: { inc, dec },
    },
    double$,
  ] = useContexts(ServiceA.id, ServiceB.id);
  const count = useReplaySubject(state$);
  const doubled = useReplaySubject(double$);
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
