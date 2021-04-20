// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="@types/jest" />

import { renderHook } from "@testing-library/react-hooks";
import { useUpdated } from "../src/hooks";

test("useUpdated", () => {
  let a = 1;
  let updateCount = 0;
  let renderCount = 0;
  const api = renderHook(
    ({ p }) => {
      renderCount++;
      return useUpdated(() => {
        updateCount++;
      }, [p]);
    },
    {
      initialProps: { p: a },
    },
  );

  api.rerender({ p: a });
  api.rerender({ p: a });
  expect(renderCount).toBe(3);
  expect(updateCount).toBe(0);
  a++;
  api.rerender({ p: a });
  api.rerender({ p: a });
  expect(renderCount).toBe(5);
  expect(updateCount).toBe(1);
});
