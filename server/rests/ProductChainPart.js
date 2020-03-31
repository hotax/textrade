const {
    ifMatchChainPart,
    updateChainPart,
    removeChainPart,
    findProductChainPartById
} = require('../biz/Product')

const ifNoneMatch = (id, version) => {
    return ifMatchChainPart(id, version)
        .then(match => {
            return !match
        })
}

/* const read = function (id) {
    return findProductChainPartById(id)
} */

module.exports = {
    url: '/textrade/api/products/chains/parts/:id',
    transitions: {
        ProductChainPartQuot: {id: 'context.part'}
    },
    rests: [{
            type: 'read',
            ifNoneMatch,
            dataRef: {Part: 'part'},
            handler: findProductChainPartById
        },
        {
            type: 'update',
            ifMatch: ifMatchChainPart,
            handler: updateChainPart
        },
        {
            type: 'delete',
            handler: removeChainPart
        }
    ]
}