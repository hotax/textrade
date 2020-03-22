const entity = require('../biz/PartQuot')

const list = function ({id}) {
    return entity.searchBySupplier(id)
        .then(function (list) {
            return {
                items: list
            }
        })
}

module.exports = {
    url: '/textrade/api/suppliers/:id/parts',
    transitions: {
    },
    rests: [{
            type: 'create',
            target: 'SupplierPart',
            handler: (req) => {
                return entity.create({supplier: req.params.id, ...req.body})
            }
        },
        {
            type: 'query',
            element: 'SupplierPart',
            handler: list
        }
    ]
}