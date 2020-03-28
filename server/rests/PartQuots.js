const entity = require('../biz/PartQuot')

const list = function ({id}) {
    return entity.listQuotsById(id)
        .then(function (list) {
            return {
                items: list
            }
        })
}

module.exports = {
    url: '/textrade/api/part-supplier/:id/quots',
    transitions: {
        PartQuot: {id: 'context'},
        SupplierParts: {id: 'context.id'},
        PartSuppliers: {id: 'context.id'}
    },
    rests: [{
            type: 'create',
            target: 'PartQuot',
            handler: (req) => {
                return entity.create(req.body, req.params.id)
            }
        },
        {
            type: 'query',
            element: 'PartQuot',
            handler: list
        }
    ]
}