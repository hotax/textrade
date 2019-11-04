/**
 * Created by clx on 2017/10/13.
 */
const {
    ifMatch,
    ifNoneMatch,
    update,
    remove,
    findById
} = require('../biz/bas/Parts');

module.exports = {
    url: '/cross/api/bas/parts/:id',
    transitions: {
        Purchase: {id: 'context.part'},
        Withdraw: {id: 'context.part'}
    },
    rests: [{
            type: 'read',
            ifNoneMatch,
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