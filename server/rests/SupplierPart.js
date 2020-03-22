const entity = require('../biz/PartQuot')

const read = function (id, {supplier, part}) {
    return entity.findSupplierPart(supplier, part)
}

module.exports = {
    url: '/textrade/api/suppliers/:supplier/parts/:part',
    transitions: {
        SupplierPart: {supplier: 'params.supplier', part: 'params.part'},
        SupplierParts: {supplier: 'params.id', part: 'context.part'},
        PartSuppliers: {part: 'params.id', supplier: 'context.supplier'}
    },
    rests: [{
            type: 'read',
            dataRef: {Supplier: 'supplier', Part: 'part'},
            handler: read
        }
    ]
}