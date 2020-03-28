const {findQuotById, ifMatchQuot, updateQuot, removeQuot} = require('../biz/PartQuot')

const ifNoneMatch = (id, version) => {
    return ifMatchQuot(id, version)
        .then(match => {
            return !match
        })
}

module.exports = {
    url: '/textrade/api/partquots/:id',
    transitions: {
        PartSuppliers: {id: 'context.id'},
        SupplierParts: {id: 'context.id'},
        ProductChainPartQuots: {id: 'context.quot'}
    },
    rests: [{
            type: 'read',
            ifNoneMatch,
            dataRef: {Supplier: 'supplier', Part: 'part', PartQuots: 'partQuots'},
            handler: findQuotById
        },
        {
            type: 'update',
            ifMatch: ifMatchQuot,
            handler: updateQuot
        },
        {
            type: 'delete',
            handler: removeQuot
        }
    ]
}