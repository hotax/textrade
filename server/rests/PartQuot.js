const entity = require('../biz/PartQuot')

module.exports = {
    url: '/textrade/api/partquots/:id',
    transitions: {
    },
    rests: [{
            type: 'read',
            dataRef: {Supplier: 'supplier', Part: 'part', PartQuots: 'PartQuot'},
            handler: entity.findQuotById
        }
    ]
}