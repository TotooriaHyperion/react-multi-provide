import React, { memo } from "react";
import { DependencyInjection } from "./DI";
import { Inner } from "./Inner";
import { Inner2 } from "./Inner2";
import { Inner3 } from "./Inner3";
import { Outer } from "./Outer";
import { Outer2 } from "./Outer2";

export const App = memo(function App() {
  return (
    <>
      <h2>Basic Example</h2>
      <Outer>
        <Inner />
        <Inner2 />
        <Inner3 />
      </Outer>
      <h2>ProvideMany</h2>
      <Outer2>
        <Inner />
        <Inner2 />
        <Inner3 />
      </Outer2>
      <h2>Dependency Injection</h2>
      <DependencyInjection />
    </>
  );
});
