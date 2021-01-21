import React, { useContext, useMemo, useRef } from "react";
import { ProvidersContext } from "./context";
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
  const currContext = useMemo<ProvidersViewModel.ProvidersContextValue>(() => {
    return {
      get: (id) => contexts.get(id),
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