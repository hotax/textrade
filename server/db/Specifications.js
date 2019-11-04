const specSchema = require('./models/specification'),
    dbSave = require('@finelets/hyper-rest/db/mongoDb/SaveObjectToDb'),
    _ = require('underscore'),
    logger = require('@finelets/hyper-rest/app/Logger');

module.exports = {
    add: function (data) {
        return dbSave(specSchema, data)
            .then(function (data) {
                return data.toJSON();
            })
    },
    findById: function (id) {
        return specSchema.findById(id)
            .then(function (data) {
                var result = data.toJSON();
                logger.debug('The spec[' + id + ']: ' + JSON.stringify(result));
                return data.toJSON();
            })
    },
    find: function (condi) {
        return specSchema.find(condi)
            .then(function (docs) {
                return _.map(docs, function (doc) {
                    return doc.toJSON();
                })
            })
    }
}