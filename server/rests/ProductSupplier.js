/**
 * Created by clx on 2017/10/13.
 */
const {ifMatch, ifNoneMatch, update, remove, findById} = require('../biz/ProductSupplier')

module.exports = {
    url: '/textrade/api/products/:product/suppliers/:id',
    transitions: {
    },
    rests: [{
            type: 'read',
            ifNoneMatch,
            dataRef: {Product: 'product', Supplier: 'supplier'},
            handler: (id, {product}) => {
                return findById(product, id)
            }
        },
        {
            type: 'update',
            ifMatch,
            handler: (id, data) => {
                data.id = id
                return update(data)
            }
        },
        {
            type: 'delete',
            handler: remove
        }
    ]
}