# react-multi-provide

- solve the problem that react context takes extra view tree.
- also preserve reactivity of what was injected
- fractal between providers
- use Map to store the dependencies
- use Object wrapped symbol to achieve better typescript support, dependency injection & debug experience
- v2.x
  - support [dependency injection](#dependency-injection)

## Example

Outer.tsx

```typescript
import React from "react";
import { Providers, useCreateContexts, useProvide, useInit } from "../..";
import { createService, ServiceA } from "./service";

export const Outer: React.FC = ({ children }) => {
  const contexts = useCreateContexts();
  const service = useInit(createService, []);
  useProvide(contexts, ServiceA.id, service);
  return <Providers contexts={contexts}>{children}</Providers>;
};
```

Inner2.tsx

```typescript
import React from "react";
import { useContexts, useReplaySubject } from "../..";
import { ServiceA } from "./service";

export const Inner2: React.FC = () => {
  const [
    {
      state$,
      actions: { inc, dec },
    },
  ] = useContexts([ServiceA.id]);
  const count = useReplaySubject(state$);
  return (
    <>
      <p>{count}</p>
      <div>
        <button onClick={inc}>Increment</button>
        <button onClick={dec}>Decrement</button>
      </div>
    </>
  );
};
```

## Dependency Injection

see [Example](./packages/react-multi-provide/src/dependency_injection/Readme.md)

## Notice

- I don't recommend you to **heavily rely on context's reactivity**, because it's better to provider **the access to the data** rather than the data itself. What @gaearon has said at https://github.com/facebook/react/issues/14620#issuecomment-455652349 about don't subscribe to too many contexts was right. But he didn't mention that **it's a wrong pattern to solve the data subscription by relying on context's reactivity**. So the right thing to do is **not to use multiple contexts** but **provide your dependencies in one context**. And meanwhile, keep your contexts **as stable as possible**.
- And thus, if we want a better API, we need handle it ourself, and keep in mind to **make the API fractal**. That's what my package is for.
