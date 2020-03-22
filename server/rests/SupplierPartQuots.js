const entity = require('../biz/PartQuot')

const list = function ({supplier, part}) {
    return entity.listQuots(supplier, part)
        .then(function (list) {
            return {
                items: list
            }
        })
}

module.exports = {
    url: '/textrade/api/suppliers/:supplier/parts/:part/quots',
    transitions: {
        SupplierPart: {supplier: 'params.supplier', part: 'params.part'}
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
            element: 'PartQuot',
            handler: list
        }
    ]
}