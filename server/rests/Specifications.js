const specsDb = require('../db/Specifications'),
    logger = require('@finelets/hyper-rest/app/Logger');

const list = function (query) {
    logger.debug(JSON.stringify(query));
    var condi;
    try {
        condi = JSON.parse(query.q);
    } catch (e) {
        condi = {}
    }
    return specsDb.find(condi)
        .then(function (list) {
            return {
                items: list
            }
        })
};

module.exports = {
    url: '/api/specs',
    rests: [{
            type: 'create',
            target: 'Specification',
            handler: specsDb.add
        },
        {
            type: 'query',
            element: 'Specification',
            handler: list
        }
    ]
}