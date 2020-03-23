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
        SupplierParts: {id: 'context'},
        PartSuppliers: {id: 'context'}
    },
    rests: [{
            type: 'create',
            target: 'PartQuot',
            dataRef: {Supplier: 'supplier', Part: 'part'},
            handler: (req) => {
                return entity.create(req.body)
            }
        },
        {
            type: 'query',
            element: 'PartQuot',
            handler: list
        }
    ]
}