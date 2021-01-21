import ReactDOM from "react-dom";
import { Observable } from "rxjs";

export const reactBatch = <T>(obs: Observable<T>): Observable<T> => {
  return new Observable<T>((observer) => {
    // 如果是测试环境（对model进行单元测试）
    // 则需要把 unstable_batchedUpdates 替换成直接执行
    return obs.subscribe({
      next: (v) => ReactDOM.unstable_batchedUpdates(() => observer.next(v)),
      error: (err) => observer.error(err),
      complete: () => observer.complete(),
    });
  });
};
