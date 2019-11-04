const validator = require('rulebased-validator');

class __ExtractBasedRule {
    constructor(fields, rules) {
        this.__fields = fields
        this.__rules = rules
    }

    extract(obj) {
        const fields = this.__fields
        const rules = this.__rules

        const __extract = (obj) => {
            let result = {}
            fields.forEach((f) => {
                if (obj[f] || obj[f] === false) {
                    result[f] = obj[f]
                }
            })
            return result
        }

        let data = __extract(obj)
        let result = validator.validate(data, rules);
        if (result === true) return data
        throw result
    }
}

module.exports = (fields, rules) => {
    let extractor = new __ExtractBasedRule(fields, rules)
    return (obj) => {
        return extractor.extract(obj)
    }
}