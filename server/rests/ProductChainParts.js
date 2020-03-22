const entity = require('../biz/Product')

const list = function ({id, product}) {
    return entity.listChainParts(id, product)
        .then(function (list) {
            return {
                items: list
            }
        })
}

module.exports = {
    url: '/textrade/api/products/:product/chains/:id/parts',
    transitions: {
    },
    rests: [{
            type: 'create',
            target: 'ProductChainPart',
            handler: (req) => {
                return entity.addChainPart(req.params.id, req.body, req.params.product)
            }
        },
        {
            type: 'query',
            element: 'ProductChainPart',
            handler: list
        }
    ]
}