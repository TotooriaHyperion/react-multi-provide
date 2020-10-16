import React from "react";
import { useInject, useReplaySubject } from "../..";
import { ServiceA } from "./service";

export const Inner: React.FC = () => {
  const {
    state$,
    actions: { inc, dec },
  } = useInject(ServiceA.id);
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
