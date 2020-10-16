# react-multi-provide

- solve the problem that react context takes extra view tree.
- also preserve reactivity of what was injected
- fractal between providers
- use WeakMap to store the dependencies
- use Object wrapped symbol to achieve better typescript support, dependency injection & debug experience

## Notice

- I don't recommend you to **heavily rely on context's reactivity**, because it's better to provider **the access to the data** rather than the data itself. What @gaearon has said at https://github.com/facebook/react/issues/14620#issuecomment-455652349 about don't subscribe to too many contexts was right. But he didn't mention that **it's a wrong pattern to solve the data subscription by relying on context's reactivity**. So the right thing to do is **not to use multiple contexts** but **provide your dependencies in one context**. And meanwhile, keep your contexts **as stable as possible**.
- And thus, if we want a better API, we need handle it ourself, and keep in mind to **make the API fractal**. That's what my package is for.
