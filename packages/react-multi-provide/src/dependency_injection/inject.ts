import { ProvidersViewModel } from "../types";

export interface InjectSpec {
  id: ProvidersViewModel.ContextIdentifier;
  key: string;
}

type InjectOptions = Omit<InjectSpec, "id">;

// 构建索引: constructor -> propertyKey -> injectSpec
export function inject<T>(
  id: ProvidersViewModel.ContextIdentifier<T>,
  options?: InjectOptions,
): PropertyDecorator {
  return (tar, key) => {
    setDepSpec(tar.constructor, key as string, {
      ...options,
      key: key as string,
      id,
    });
  };
}

const depsSpecMap = new Map<ConstructorOrClass, Map<string, InjectSpec>>();

export type ConstructorOrClass = { new (): any } | Function;

// 根据 constructor/class 获取某个类的依赖 Map: Map<Key, InjectSpec>
export function ensureDepsMap(
  cls: ConstructorOrClass,
): Map<string, InjectSpec> {
  if (!depsSpecMap.has(cls)) {
    depsSpecMap.set(cls, new Map());
  }
  return depsSpecMap.get(cls)!;
}

// 获取某个类的某个依赖的 id
export function getDepSpec(
  cls: {
    new (): any;
  },
  key: string,
) {
  return ensureDepsMap(cls).get(key);
}

export function setDepSpec(
  cls: ConstructorOrClass,
  key: string,
  spec: InjectSpec,
) {
  ensureDepsMap(cls).set(key, spec);
}
