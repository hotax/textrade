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
        ProductChainPartQuot: {id: 'context'}
    },
    rests: [{
            type: 'read',
            ifNoneMatch,
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