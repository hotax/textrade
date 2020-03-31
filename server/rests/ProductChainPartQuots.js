const entity = require('../biz/ProductChainQuot')()

const list = function ({id}) {
    return entity.listQuots(id)
        .then(function (list) {
            return {
                items: list
            }
        })
}

module.exports = {
    url: '/textrade/api/products/chains/parts/:id/quots',
    transitions: {
        ProductChainPartQuot: {id: 'context.part'}
    },
    rests: [{
            type: 'create',
            target: 'ProductChainPartQuot',
            handler: (req) => {
                return entity.addQuot(req.params.id, req.body)
            }
        },
        {
            type: 'query',
            element: 'ProductChainPartQuot',
            handler: list
        }
    ]
}