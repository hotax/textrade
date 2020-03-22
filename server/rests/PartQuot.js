const entity = require('../biz/PartQuot')

/* const read = function (id, {supplier, part}) {
    return entity.findSupplierPart(supplier, part)
} */

module.exports = {
    url: '/textrade/api/partquots/:id',
    transitions: {
    },
    rests: [{
            type: 'read',
            /* dataRef: {Supplier: 'supplier', Part: 'part'}, */
            handler: entity.findQuotById
        }
    ]
}