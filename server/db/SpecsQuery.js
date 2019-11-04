const Specs = require('./models/specification'),
    _ = require('underscore');

module.exports = {
    find: function (cond) {
        return Specs.find(cond)
            .then(function (docs) {
                return _.map(docs, function (doc) {
                    return doc.toJSON();
                })
            })
    }
}