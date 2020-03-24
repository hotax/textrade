const entity = require('../biz/Product')

const read = function (id, {product}) {
    return entity.findChainById(id, product)
}

module.exports = {
    url: '/textrade/api/products/chains/:id',
    transitions: {
        ProductChainPart: {id: 'context'}
    },
    rests: [{
            type: 'read',
            dataRef: {User: 'creator'},
            handler: read
        }
    ]
}