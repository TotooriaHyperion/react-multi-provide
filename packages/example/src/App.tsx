import React, { memo } from "react";
import { Inner } from "./Inner";
import { Inner2 } from "./Inner2";
import { Inner3 } from "./Inner3";
import { Outer } from "./Outer";

export const App = memo(function App() {
  return (
    <Outer>
      <Inner />
      <Inner2 />
      <Inner3 />
    </Outer>
  );
});
