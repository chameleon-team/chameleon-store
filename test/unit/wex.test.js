import '../global/wex'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'
import chai from 'chai';
const expect = chai.expect

chai.use(sinonChai)

import { resolveTestSrc } from '../build/util'

const createStoreModulePath = resolveTestSrc('interfaces/createStore/index', 'web')

const createStore = require(createStoreModulePath).default

const TEST = 'TEST'
const isSSR = process.env.VUE_ENV === 'server'

describe('Store', () => {
  it('committing mutations', () => {
    const store = createStore({
      state: {
        a: 1
      },
      mutations: {
        [TEST] (state, n) {
          state.a += n
        }
      }
    })
    store.commit(TEST, 2)
    debugger
    expect(store.state.a).to.equal(3)
  })

  it('committing with object style', () => {
    const store = createStore({
      state: {
        a: 1
      },
      mutations: {
        [TEST] (state, payload) {
          state.a += payload.amount
        }
      }
    })
    store.commit({
      type: TEST,
      amount: 2
    })
    expect(store.state.a).to.equal(3)
  })

  it('asserts committed type', () => {
    const store = createStore({
      state: {
        a: 1
      },
      mutations: {
        // Maybe registered with undefined type accidentally
        // if the user has typo in a constant type
        undefined (state, n) {
          state.a += n
        }
      }
    })
    expect(() => {
      store.commit(undefined, 2)
    }).to.throw(Error, /Expects string as the type, but found undefined/)
    expect(store.state.a).to.equal(1)
  })

  it('dispatching actions, sync', () => {
    const store = createStore({
      state: {
        a: 1
      },
      mutations: {
        [TEST] (state, n) {
          state.a += n
        }
      },
      actions: {
        [TEST] ({ commit }, n) {
          commit(TEST, n)
        }
      }
    })
    store.dispatch(TEST, 2)
    expect(store.state.a).to.equal(3)
  })

  it('dispatching with object style', () => {
    const store = createStore({
      state: {
        a: 1
      },
      mutations: {
        [TEST] (state, n) {
          state.a += n
        }
      },
      actions: {
        [TEST] ({ commit }, payload) {
          commit(TEST, payload.amount)
        }
      }
    })
    store.dispatch({
      type: TEST,
      amount: 2
    })
    expect(store.state.a).to.equal(3)
  })

  it('dispatching actions, with returned Promise', done => {
    const store = createStore({
      state: {
        a: 1
      },
      mutations: {
        [TEST] (state, n) {
          state.a += n
        }
      },
      actions: {
        [TEST] ({ commit }, n) {
          return new Promise(resolve => {
            setTimeout(() => {
              commit(TEST, n)
              resolve()
            }, 0)
          })
        }
      }
    })
    expect(store.state.a).to.equal(1)
    store.dispatch(TEST, 2).then(() => {
      expect(store.state.a).to.equal(3)
      done()
    })
  })

  it('composing actions with async/await', done => {
    const store = createStore({
      state: {
        a: 1
      },
      mutations: {
        [TEST] (state, n) {
          state.a += n
        }
      },
      actions: {
        [TEST] ({ commit }, n) {
          return new Promise(resolve => {
            setTimeout(() => {
              commit(TEST, n)
              resolve()
            }, 0)
          })
        },
        two: async ({ commit, dispatch }, n) => {
          await dispatch(TEST, 1)
          expect(store.state.a).to.equal(2)
          commit(TEST, n)
        }
      }
    })
    expect(store.state.a).to.equal(1)
    store.dispatch('two', 3).then(() => {
      expect(store.state.a).to.equal(5)
      done()
    })
  })

  it('detecting action Promise errors', done => {
    const store = createStore({
      actions: {
        [TEST] () {
          return new Promise((resolve, reject) => {
            reject('no')
          })
        }
      }
    })
    const spy = sinon.spy()
    store._devtoolHook = {
      emit: spy
    }
    const thenSpy = sinon.spy()
    store.dispatch(TEST)
      .then(thenSpy)
      .catch(err => {
        // expect(thenSpy).should.have.not.been.called()
        expect(err).to.equal('no')
        expect(spy).to.have.been.calledWith('vuex:error', 'no')
        done()
      })
  })

  it('asserts dispatched type', () => {
    const store = createStore({
      state: {
        a: 1
      },
      mutations: {
        [TEST] (state, n) {
          state.a += n
        }
      },
      actions: {
        // Maybe registered with undefined type accidentally
        // if the user has typo in a constant type
        undefined ({ commit }, n) {
          commit(TEST, n)
        }
      }
    })
    expect(() => {
      store.dispatch(undefined, 2)
    }).to.throw(Error, /Expects string as the type, but found undefined/)
    expect(store.state.a).to.equal(1)
  })

  it('getters', () => {
    const store = createStore({
      state: {
        a: 0
      },
      getters: {
        state: state => state.a > 0 ? 'hasAny' : 'none'
      },
      mutations: {
        [TEST] (state, n) {
          state.a += n
        }
      },
      actions: {
        check ({ getters }, value) {
          // check for exposing getters into actions
          expect(getters.state).to.equal(value)
        }
      }
    })
    expect(store.getters.state).to.equal('none')
    store.dispatch('check', 'none')

    store.commit(TEST, 1)

    expect(store.getters.state).to.equal('hasAny')
    store.dispatch('check', 'hasAny')
  })

  it('store injection', () => {
    const store = createStore()
    const vm = new Vue({
      store
    })
    const child = new Vue({ parent: vm })
    expect(child.$store).to.equal(store)
  })

  it('should warn silent option depreciation', () => {
    sinon.spy(console, 'warn')

    const store = createStore({
      mutations: {
        [TEST] () {}
      }
    })
    store.commit(TEST, {}, { silent: true })

    expect(console.warn).to.have.been.calledWith(
      `[vuex] mutation type: ${TEST}. Silent option has been removed. ` +
      'Use the filter functionality in the vue-devtools'
    )
  })

  it('should accept state as function', () => {
    const store = createStore({
      state: () => ({
        a: 1
      }),
      mutations: {
        [TEST] (state, n) {
          state.a += n
        }
      }
    })
    expect(store.state.a).to.equal(1)
    store.commit(TEST, 2)
    expect(store.state.a).to.equal(3)
  })

  // it('should not call root state function twice', () => {
  //   const spy = sinon.spy()
  //   createStore({
  //     state: spy
  //   })
  //   expect(spy).to.have.been.calledOnce()
  // })

  it('subscribe: should handle subscriptions / unsubscriptions', () => {
    const subscribeSpy = sinon.spy()
    const secondSubscribeSpy = sinon.spy()
    const testPayload = 2
    const store = createStore({
      state: {},
      mutations: {
        [TEST]: () => {}
      }
    })

    const unsubscribe = store.subscribe(subscribeSpy)
    store.subscribe(secondSubscribeSpy)
    store.commit(TEST, testPayload)
    unsubscribe()
    store.commit(TEST, testPayload)

    expect(subscribeSpy).to.have.been.calledWith(
      { type: TEST, payload: testPayload },
      store.state
    )
    // expect(secondSubscribeSpy).to.have.been.called()
    expect(subscribeSpy).to.have.been.callCount(1)
    expect(secondSubscribeSpy).to.have.been.callCount(2)
  })

  // store.watch should only be asserted in non-SSR environment
  if (!isSSR) {
    it('strict mode: warn mutations outside of handlers', () => {
      const store = createStore({
        state: {
          a: 1
        },
        strict: true
      })
      Vue.config.silent = true
      expect(() => { store.state.a++ }).to.throw()
      Vue.config.silent = false
    })

    it('watch: with resetting vm', done => {
      const store = createStore({
        state: {
          count: 0
        },
        mutations: {
          [TEST]: state => state.count++
        }
      })

      const spy = sinon.spy()
      store.watch(state => state.count, spy)

      // reset store vm
      store.registerModule('test', {})

      Vue.nextTick(() => {
        store.commit(TEST)
        expect(store.state.count).to.equal(1)

        Vue.nextTick(() => {
          // expect(spy).to.have.been.called()
          done()
        })
      })
    })

    it('watch: getter function has access to store\'s getters object', done => {
      const store = createStore({
        state: {
          count: 0
        },
        mutations: {
          [TEST]: state => state.count++
        },
        getters: {
          getCount: state => state.count
        }
      })

      const getter = function getter (state, getters) {
        return state.count
      }
      const spy = sinon.spy({ getter }, 'getter')
      const spyCb = sinon.spy()

      store.watch(spy, spyCb)

      Vue.nextTick(() => {
        store.commit(TEST)
        expect(store.state.count).to.equal(1)

        Vue.nextTick(() => {
          expect(spy).to.have.been.calledWith(store.state, store.getters)
          done()
        })
      })
    })
  }
})
