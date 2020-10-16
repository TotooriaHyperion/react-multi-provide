import { BehaviorSubject, Observable } from "rxjs";
import { createId } from "../..";

export module ServiceA {
  export interface Model {
    state$: Observable<number>;
    actions: {
      inc: () => void;
      dec: () => void;
    };
  }
  export const id = createId<Model>(Symbol("ServiceA"));
}

export function createService(): ServiceA.Model {
  const subject = new BehaviorSubject(0);
  return {
    state$: subject,
    actions: {
      inc: () => subject.next(subject.getValue() + 1),
      dec: () => subject.next(subject.getValue() - 1),
    },
  };
}
