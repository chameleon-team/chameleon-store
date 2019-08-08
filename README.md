# chameleon-store [![version](https://img.shields.io/npm/v/chameleon-tool.svg?style=flat)](https://www.npmjs.com/package/chameleon-store)
本仓库为 `cml` 框架的数据管理相关代码，提供集中管理数据的能力

详细见[cml数据管理](https://cmljs.org/doc/logic/store.html)

## 接口文档

chameleon-store 对外提供跨端的数据管理接口，api查看及扩展等请见文档，[cml.createStore](https://cmljs.org/doc/logic/store.html#chameleonstorecreatestoreoptions-object-object)


例如:
``` javascript
import createStore from 'chameleon-store'

const store = createStore({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
    }
  }
})
export default store
```
