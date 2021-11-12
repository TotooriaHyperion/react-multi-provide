import React from "react";
import {
  Providers,
  useCreateContexts,
  useInit,
  useProvideMany,
} from "react-multi-provide";
import { useChangeDetect, useRenderCount } from "./hooks";
import { createService, ServiceA, createB, ServiceB } from "./service";

export const Outer2: React.FC = ({ children }) => {
  const contexts = useCreateContexts();
  const service = useInit(createService, []);
  const serviceB = useInit(() => createB(service.state$), [service]);
  // console.log(123);
  useProvideMany(contexts, [
    [ServiceA.id, service],
    [ServiceB.id, serviceB],
  ]);
  useRenderCount("Outer2");
  useChangeDetect({ contexts, service, serviceB }, "Outer2");
  return <Providers contexts={contexts}>{children}</Providers>;
};
