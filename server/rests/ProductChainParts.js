const entity = require('../biz/Product')

const list = function ({id}) {
    return entity.listChainParts(id)
        .then(function (list) {
            return {
                items: list
            }
        })
}

module.exports = {
    url: '/textrade/api/products/chains/:id/parts',
    transitions: {
        ProductChainPart: {id: 'context.chain'}
    },
    rests: [{
            type: 'create',
            target: 'ProductChainPart',
            handler: (req) => {
                return entity.addChainPart(req.params.id, req.body)
            }
        },
        {
            type: 'query',
            element: 'ProductChainPart',
            handler: list
        }
    ]
}