/**
 * Created by clx on 2017/10/13.
 */
const {
    ifMatch,
    ifNoneMatch,
    update,
    remove,
    findById
} = require('../biz/Employee');

module.exports = {
    url: '/textrade/api/users/:id',
    transitions: {
        Part: {id: 'context'},
        Product: {id: 'context'},
        ProductChain: {id: 'context'},
        Customer: {id: 'context'},
        Supplier: {id: 'context'},
        CustomerRequirement: {id: 'context'}
    },
    rests: [{
            type: 'read',
            ifNoneMatch,
            dataRef: {Avatar: 'pic'},
            handler: findById
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
