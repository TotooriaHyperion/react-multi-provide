import React, { memo } from "react";
import { Inner } from "./Inner";
import { Inner2 } from "./Inner2";
import { Outer } from "./Outer";

export const App = memo(function App() {
  return (
    <Outer>
      <Inner />
      <Inner2 />
    </Outer>
  );
});
