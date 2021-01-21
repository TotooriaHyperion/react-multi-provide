import { useEffect, useDebugValue, useRef } from "react";

export interface ChangeSpec {
  key: string;
  oldValue: any;
  newValue: any;
}

export function useRenderCount(name: string) {
  const renderRef = useRef(0);
  renderRef.current++;
  useDebugValue(renderRef.current);
  console.log(name, renderRef.current);
}

export function useChangeDetect(obj: Record<string, any>, name?: string) {
  const prevObjRef = useRef<Record<string, any>>({});
  const mountedRef = useRef(false);
  useEffect(() => {
    const prev = prevObjRef.current;
    const curr = obj;
    prevObjRef.current = obj;
    if (prev !== curr) {
      const keysCurr = Object.keys(curr);
      const changed: ChangeSpec[] = [];
      keysCurr.forEach((key) => {
        if (curr[key] !== prev[key]) {
          changed.push({
            key,
            oldValue: prev[key],
            newValue: curr[key],
          });
        }
      });
      changed.forEach((item) => {
        const isUpdate = mountedRef.current === true;
        if (isUpdate) {
          console.log(
            `[Profiler.change][${name}] ${item.key} has changed from`,
            item.oldValue,
            "to",
            item.newValue,
          );
        }
      });
    }
    if (!mountedRef.current) {
      console.log(`[Profiler.init][${name}] Component has inited with`, curr);
    }
    mountedRef.current = true;
  });
}
