const entity = require('../biz/Customer')

const list = function (query) {
    const product = query.product,
    type = entity.constDef.QUERY_TYPE_PRODUCT_QUOTS
    return entity.searchQuots({product, type})
        .then(function (list) {
            return {
                data: list
            }
        })
}

module.exports = {
    url: '/textrade/api/products/:product/quots',
    transitions: {
        Product: {product: 'params.id'}
    },
    rests: [{
            type: 'get',
            dataRef: {
                Customer: 'data.customer',
                Supplier: 'data.supplier'
            },
            handler: list
        }
    ]
}