const entity = require('../biz/ProductSupplier')

const list = function (query) {
    return entity.list(query.product)
        .then(function (list) {
            return {
                items: list
            }
        })
}

module.exports = {
    url: '/textrade/api/products/:product/suppliers',
    transitions: {
        Product: {product: 'params.id'},
        ProductSupplier: {product: 'params.product'}
    },
    rests: [{
            type: 'create',
            target: 'ProductSupplier',
            handler: (req) => {
                return entity.create(req.params['product'], req.body)
            }
        },
        {
            type: 'query',
            element: 'ProductSupplier',
            handler: list
        }
    ]
}