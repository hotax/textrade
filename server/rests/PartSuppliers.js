const entity = require('../biz/PartQuot')

const list = function ({id}) {
    return entity.searchByPart(id)
        .then(function (list) {
            return {
                items: list
            }
        })
}

module.exports = {
    url: '/textrade/api/parts/:id/suppliers',
    transitions: {
    },
    rests: [{
            type: 'create',
            target: 'SupplierPart',
            handler: (req) => {
                return entity.create({part: req.params.id, ...req.body})
            }
        },
        {
            type: 'query',
            element: 'SupplierPart',
            handler: list
        }
    ]
}