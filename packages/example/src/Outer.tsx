import React from "react";
import {
  Providers,
  useCreateContexts,
  useInit,
  useProvide,
} from "react-multi-provide";
import { useChangeDetect, useRenderCount } from "./hooks";
import { createService, ServiceA, createB, ServiceB } from "./service";

export const Outer: React.FC = ({ children }) => {
  const contexts = useCreateContexts();
  const service = useInit(createService, []);
  const serviceB = useInit(() => createB(service.state$), [service]);
  // console.log(123);
  useProvide(contexts, ServiceA.id, service);
  useProvide(contexts, ServiceB.id, serviceB);
  useRenderCount("Outer");
  useChangeDetect({ contexts, service, serviceB }, "Outer");
  return <Providers contexts={contexts}>{children}</Providers>;
};
