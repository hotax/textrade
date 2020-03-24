const entity = require('../biz/Product')

const list = function (query) {
    return entity.listChains(query.id)
        .then(function (list) {
            return {
                items: list
            }
        })
}

module.exports = {
    url: '/textrade/api/products/:id/chains',
    transitions: {
        ProductChain: {id: 'context.product'},
        ProductChains: {id: 'params.id'}
    },
    rests: [{
            type: 'create',
            target: 'ProductChain',
            handler: (req) => {
                return entity.createChain(req.params.id, req.body)
            }
        },
        {
            type: 'query',
            element: 'ProductChain',
            handler: list
        }
    ]
}