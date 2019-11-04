const __ = require('underscore')
const __doNothing = () => {
    return Promise.resolve()
}

class State {
    constructor(ctx, stateDef) {
        if (__.isObject(stateDef)) {
            this.__state = stateDef.state
            this.entry = stateDef.entry ? (__.isString(stateDef.entry) ? ctx[stateDef.entry] : stateDef.entry) : __doNothing
            this.exit = stateDef.exit ? (__.isString(stateDef.exit) ? ctx[stateDef.exit] : stateDef.exit) : __doNothing
        } else {
            this.__state = stateDef
            this.entry = __doNothing
            this.exit = __doNothing
        }
    }

    isMe(state) {
        return state === this.__state
    }
}

class Transition {
    constructor(ctx, def) {
        this.__from = new State(ctx, def.from)
        this.__to = new State(ctx, def.to)
        this.__when = def.when
        this.__guard = def.guard ? (__.isString(def.guard) ? ctx[def.guard] : def.guard) : () => {
            return Promise.resolve(true)
        }
    }

    accept(from, when) {
        return this.__from.isMe(from) && when === this.__when
    }

    trigger(payload, id) {
        return this.__guard(payload, id)
            .then((pass) => {
                if (pass) {
                    return this.__from.exit(payload, id)
                        .then(() => {
                            return this.__to.entry(payload, id)
                        })
                        .then(() => {
                            return this.__to.__state
                        })
                }
                return false
            })
    }
}

class TaskExecutionStates {
    constructor(graph) {
        this.__ctx = graph.context
        this.__transitions = __.map(graph.transitions, (e) => {
            return new Transition(this.__ctx, e)
        })
    }

    trigger(when, payLoad, id) {
        let ctx = this.__ctx
        let trans = this.__transitions
        let toState
        return ctx.getState(id)
            .then((state) => {
                toState = state
                let route = __.find(trans, (e) => {
                    return e.accept(state, when)
                })
                if (route) {
                    return route.trigger(payLoad, id)
                        .then((state) => {
                            if (state) {
                                toState = state
                                return ctx.updateState(state, payLoad, id)
                            }
                        })
                }
            })
            .then(() => {
                return toState
            })
    }
}

const createFsm = (graph) => {
    if (!graph) throw 'States transition graph is not defined'
    if (!graph.context) throw 'context interface is not defined in states transition graph'
    if (!graph.context.getState) throw 'context.getState interface is not defined in states transition graph'
    return new TaskExecutionStates(graph)
}

module.exports = createFsm