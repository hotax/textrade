const logger = require('@finelets/hyper-rest/app/Logger'),
    __ = require('underscore');

module.exports = (schema, uniqueFields, data) => {
    let condi = __.map(uniqueFields, fld => {
        let exp = {}
        if (data[fld]) {
            exp[fld] = data[fld]
        } else {
            exp[fld] = {
                $exists: false
            }
        }
        return exp
    })
    const query = {
        $and: condi
    }
    return schema.findOneAndUpdate(query, data, {
            upsert: true,
            runValidators: true
        })
        .then(() => {
            return schema.findOne(query)
        })
        .then(doc => {
            return doc.toJSON()
        })
}