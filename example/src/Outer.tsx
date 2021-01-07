import React, { useMemo } from "react";
import { Providers, useCreateContexts, useProvide } from "../..";
import { createService, ServiceA, createB, ServiceB } from "./service";

export const Outer: React.FC = ({ children }) => {
  const contexts = useCreateContexts();
  const service = useMemo(createService, []);
  const serviceB = useMemo(() => createB(service.state$), [service]);
  useProvide(contexts, ServiceA.id, service);
  useProvide(contexts, ServiceB.id, serviceB);
  return <Providers contexts={contexts}>{children}</Providers>;
};
