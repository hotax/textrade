const entity = require('../biz/ProductChainQuots')()

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
    rests: [{
            type: 'create',
            target: 'PartQuot',
            handler: (req) => {
                return entity.addQuot(req.params.id, req.body)
            }
        },
        {
            type: 'query',
            element: 'PartQuot',
            handler: list
        }
    ]
}