const {checkQuotPart} = require('../biz/PartQuot')
const {
    ifMatchQuot,
    removeQuot,
    findQuotById
} = require('../biz/ProductChainQuot')(checkQuotPart)

const ifNoneMatch = (id, version) => {
    return ifMatchQuot(id, version)
        .then(match => {
            return !match
        })
}

module.exports = {
    url: '/textrade/api/products/chains/parts/quots/:id',
    transitions: {
    },
    rests: [{
            type: 'read',
            ifNoneMatch,
            dataRef: {PartQuot: 'quot'},
            handler: findQuotById
        },
        {
            type: 'delete',
            handler: removeQuot
        }
    ]
}