import React, { useMemo } from "react";
import { Providers, useCreateContexts, useProvide } from "../..";
import { createService, ServiceA } from "./service";

export const Outer: React.FC = ({ children }) => {
  const contexts = useCreateContexts();
  const service = useMemo(createService, []);
  useProvide(contexts, ServiceA.id, service);
  return <Providers contexts={contexts}>{children}</Providers>;
};
const d = ServiceA.id.symbolAs<number>();
