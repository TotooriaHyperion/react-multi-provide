import { createId, createServiceId, inject } from "react-multi-provide";

export interface IA {
  a: string;
}
export const IA = createServiceId<IA>(Symbol.for("IA"));

export interface IB {
  b: number;
}
export const IB = createServiceId<IB>(Symbol.for("IB"));

export interface IC {
  c: number;
}
export const IC = createId<IC>(Symbol.for("IC"));

export interface ID {
  d: number;
}
export const ID = createServiceId<ID>(Symbol.for("ID"));

export class IAImpl implements IA {
  a = "a";

  // 注入 useProvideService 中构造函数构造的对象
  @inject(IB)
  b: IB;
}

export class IBImpl implements IB {
  constructor(public b: number) {}

  // 循环依赖测试
  @inject(IA)
  a: IA;
}

export class IDImpl implements ID {
  d = 4;

  // 注入 useProvide 中直接提供的实例的对象
  @inject(IC)
  c: IC;
}
