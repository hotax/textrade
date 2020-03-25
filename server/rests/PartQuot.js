const entity = require('../biz/PartQuot')

module.exports = {
    url: '/textrade/api/partquots/:id',
    transitions: {
        PartSuppliers: {id: 'context.id'},
        SupplierParts: {id: 'context.id'},
        ProductChainPartQuots: {id: 'context.quot'}
    },
    rests: [{
            type: 'read',
            dataRef: {Supplier: 'supplier', Part: 'part', PartQuots: 'partQuots'},
            handler: entity.findQuotById
        }
    ]
}