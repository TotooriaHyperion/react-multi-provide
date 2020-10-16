# react-multi-provide

- solve the problem that react context takes extra view tree.
- also preserve reactivity of what was injected
- fractal between providers
- use WeakMap to store the dependencies
- use Object wrapped symbol to achieve better typescript support & debug experience
