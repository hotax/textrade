const entity = require('../biz/Product')

const read = function (id, {product}) {
    return entity.findChainById(id, product)
}

module.exports = {
    url: '/textrade/api/products/:product/chains/:id',
    transitions: {
        ProductChains: {product: 'params.id', id: 'context.id'}
    },
    rests: [{
            type: 'read',
            dataRef: {
                User: 'creator'
            },
            handler: read
        }
    ]
}