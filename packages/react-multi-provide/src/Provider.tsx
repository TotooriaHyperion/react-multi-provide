import React, { useContext, useRef } from "react";
import { ProvidersContext } from "./context";
import { useInit } from "./hooks";
import { ProvidersViewModel } from "./types";

export interface ProvidersProps {
  contexts: ProvidersViewModel.ProvidersContextValue;
}

export const Providers: React.FC<ProvidersProps> = ({ contexts, children }) => {
  const contextRef = useRef(contexts);
  if (contextRef.current !== contexts) {
    throw new Error(
      `Multiple Provider shouldn't be mutable to avoid full refresh for all contexts, change contexts will not work!`,
    );
  }
  const parentContexts = useContext(ProvidersContext);
  const currContext = useInit<ProvidersViewModel.ProvidersContextValue>(() => {
    return {
      get: (id) => contexts.get(id),
      getCurrent: (id) => contexts.get(id),
      set() {
        // placeholder
      },
    };
  }, [parentContexts]);
  return (
    <ProvidersContext.Provider value={currContext}>
      {children}
    </ProvidersContext.Provider>
  );
};
