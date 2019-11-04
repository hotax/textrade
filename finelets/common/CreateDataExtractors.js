const createExtractor = require('./ExtractBasedRule'),
    __ = require('underscore')

module.exports = (config) => {
    let result = {}
    __.map(config, (val, key) => {
        result[key] = createExtractor(val.fields, val.rules)
    })
    return result
}