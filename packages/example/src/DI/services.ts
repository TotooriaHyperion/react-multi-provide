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

export class IAImpl implements IA {
  a = "a";
}

export class IBImpl implements IB {
  constructor(public b: number) {}

  @inject(IA)
  a: IA;

  @inject(IC)
  c: IC;
}
