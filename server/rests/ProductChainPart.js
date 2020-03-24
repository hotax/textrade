const entity = require('../biz/Product')

const read = function (id) {
    return entity.findProductChainPartById(id)
}

module.exports = {
    url: '/textrade/api/products/chains/parts/:id',
    transitions: {
    },
    rests: [{
            type: 'read',
            dataRef: {Product: 'product', Part: 'part', ProductChain: 'chain'},
            handler: read
        }
    ]
}