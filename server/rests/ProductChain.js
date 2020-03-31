const {
    ifMatchChain,
    updateChain,
    removeChain,
    findChainById
} = require('../biz/Product')

const ifNoneMatch = (id, version) => {
    return ifMatchChain(id, version)
        .then(match => {
            return !match
        })
}

module.exports = {
    url: '/textrade/api/products/chains/:id',
    transitions: {
        ProductChainPart: {id: 'context.chain'},
        ProductChainPartQuot: {id: 'context.chain'}
    },
    rests: [{
            type: 'read',
            ifNoneMatch,
            dataRef: {User: 'creator'},
            handler: (id) => {
                return findChainById(id)
            }
        },
        {
            type: 'update',
            ifMatch: ifMatchChain,
            handler: updateChain
        },
        {
            type: 'delete',
            handler: removeChain
        }
    ]
}