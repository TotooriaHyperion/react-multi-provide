// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="@types/jest" />

import { renderHook, act } from "@testing-library/react-hooks";
import { useInit } from "../src/hooks";

test("useInit", () => {
  let a = 1;
  let initCount = 0;
  const api = renderHook(
    ({ p }) =>
      useInit(() => {
        initCount++;
      }, [p]),
    {
      initialProps: { p: a },
    },
  );

  api.rerender({ p: a });
  api.rerender({ p: a });
  expect(initCount).toBe(1);
  a++;
  api.rerender({ p: a });
  api.rerender({ p: a });
  expect(initCount).toBe(2);
});
