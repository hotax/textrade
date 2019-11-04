const mq = require('../finelets/mq/RabbitMessageCenter'),
    __ = require('underscore');

const startup = (config) => {
    return mq.start(config)
        .then(() => {
            __.each(config.exchanges, (ex, exName) => {
                if (ex.publishes && ex.publishes.length > 0) {
                    let exPublishes = {}
                    ex.publishes.forEach((p) => {
                        exPublishes[p] = (msg) => {
                            return mq.publish(exName, p, msg)
                        }
                    })
                    if (ex.isDefault) {
                        Object.assign(crossMC, exPublishes)
                    } else {
                        crossMC[ex] = exPublishes
                    }
                }
            })
        })
}

const crossMC = {
    start: startup,
}

module.exports = crossMC