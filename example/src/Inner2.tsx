import React from "react";
import { useContexts, useReplaySubject } from "../../lib";
import { ServiceA } from "./service";

export const Inner2: React.FC = () => {
  const [
    {
      state$,
      actions: { inc, dec },
    },
  ] = useContexts([ServiceA.id]);
  const count = useReplaySubject(state$);
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
