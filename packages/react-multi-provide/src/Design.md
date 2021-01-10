## React 多注入
1. 由于 Provider 都是单例的 token -> Value 因此可以合并使用。
2. 由于要支持嵌套，因此 Providers 内部是分形的实现。