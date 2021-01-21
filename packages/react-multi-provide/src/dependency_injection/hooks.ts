import { useCallback, useEffect, useMemo, useRef, useDebugValue } from "react";
import ReactDOM from "react-dom";
import { merge, Subject } from "rxjs";
import { useContexts, useProvide } from "../hooks";
import { ProvidersViewModel, ObservableServiceSymbol } from "../types";
import { ServiceIdentifier } from "./types";
import { ensureDepsMap } from "./inject";

export function useService<T extends [...ServiceIdentifier[]]>(
  ...ids: T
): {
  [K in keyof T]: T[K] extends ServiceIdentifier<infer P> ? P : never;
};
export function useService<T extends [...ServiceIdentifier[]]>(
  contexts: ProvidersViewModel.ProvidersContextValue,
  ...ids: T
): {
  [K in keyof T]: T[K] extends ServiceIdentifier<infer P> ? P : never;
};
export function useService(...ids: any): any {
  const services = useContexts(...ids);
  useDebugValue(services);
  return services;
}

type AnyFn = (...args: any[]) => any;
export function useStableCallback<T extends AnyFn>(cb: T): T {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    ((...args) => {
      return cbRef.current?.(...args);
    }) as T,
    [],
  );
}

// 根据类提供服务，本质上是 class -> inst, inst -> inject deps
// class 包含 deps 和 constructor
// 如果转化为 function
// 对于 class 在构造 class 的同时注册 annotation 标记依赖，在构造实例之后注入依赖
// 对于 function
export function useProvideService<T, Args extends any[] = []>(
  contexts: ProvidersViewModel.ProvidersContextValue,
  id: ServiceIdentifier<T>,
  ctr: new (...args: Args) => T,
  deps: Args,
) {
  // 构造函数 -> depsMap: Map<Key, InjectSpec>
  const depsMap = useMemo(() => {
    return ensureDepsMap(ctr);
  }, [ctr]);
  // depsMap -> pair[propertyKey, serviceIdentifier] -> pair[propertyKey, service]
  const dirtyRef = useRef(true);
  const serviceRef = useRef<T>(null as any);
  const resolveService = useStableCallback(() => {
    // 如果 dirty 说明依赖改变了，需要重新生成服务实例
    if (dirtyRef.current) {
      dirtyRef.current = false;
      // console.log("resolve service", id.toString());
      const inst = new ctr(...deps);
      [...depsMap.values()].forEach((spec) => {
        Object.defineProperty(inst, spec.key, {
          get() {
            // 使用 懒加载 处理循环依赖的注入
            return contexts.get(spec.id).getValue();
          },
        });
      });
      serviceRef.current = inst;
    }
    return serviceRef.current;
  });
  // 重新构造实例
  const reloadService = useStableCallback(
    (trigger: Set<ServiceIdentifier> = new Set()) => {
      if (trigger.has(id)) {
        // 循环依赖触发的循环重载，如果是自己触发的，则撤销。
        return;
      }
      trigger.add(id);
      dirtyRef.current = true;
      // console.log("reload service", id.toString());
      ReactDOM.unstable_batchedUpdates(() => {
        subject.next(trigger);
      });
    },
  );
  const subject = useMemo(() => new Subject(), []);

  // 如果服务（构造函数）改变，或参数改变，则需要重新构造实例
  // 比如从 taskId = 1 切换至 taskId = 2 则对 taskId = 2 应该有一个新的实例
  // 因为两者状态实际不共享，需要跨越两个 task 的状态不是 task 的状态，而应该被提升至上级状态
  // TODO: 是否应该使用构造函数参数？或者直接将 taskId 认为是上层 taskService 的一个 property ？
  // TODO: 实例是否支持 keepAlive ？如果要支持，那么 cacheKey 怎么定义？是否要支持 LRU 过期？
  useUpdated(reloadService, [ctr, ...deps]);

  // 如果服务的依赖改变，则重载。
  // depsMap -> reactivities -> reloadService
  useEffect(() => {
    const sub = merge(
      ...[...depsMap.values()].map((spec) => contexts.get(spec.id)),
    ).subscribe((trigger) => {
      // console.log({ v });
      reloadService(trigger);
    });
    return () => sub.unsubscribe();
  }, [depsMap]);

  // s 是响应式的服务实例
  // getValue 是 resolveService
  // subject 代表实例重载的 reactivity
  const s = useMemo(() => {
    return Object.assign(subject, {
      getValue: resolveService,
      [ObservableServiceSymbol]: true,
    });
  }, [resolveService, subject]);
  useProvide(contexts, id, s);
}

function useUpdated(handler: () => void, deps?: any[]) {
  const firstEffectRef = useRef(true);
  useEffect(() => {
    if (firstEffectRef.current) {
      firstEffectRef.current = false;
      return;
    }
    handler();
  }, deps);
}
