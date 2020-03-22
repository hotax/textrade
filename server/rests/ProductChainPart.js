const entity = require('../biz/Product')

const read = function (id, {product, chain}) {
    return entity.findChainById(id, product)
}

module.exports = {
    url: '/textrade/api/products/:product/chains/:chain/parts/:id',
    transitions: {
        /* ProductChains: {product: 'params.id', id: 'context.id'} */
    },
    rests: [{
            type: 'read',
            handler: read
        }
    ]
}