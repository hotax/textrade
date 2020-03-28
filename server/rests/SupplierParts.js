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
    rests: [{
            type: 'create',
            target: 'PartQuot',
            handler: (req) => {
                return entity.create({supplier: req.params.id, ...req.body})
            }
        },
        {
            type: 'query',
            element: 'PartQuots',
            handler: list
        }
    ]
}