const {
    ifMatch,
    ifNoneMatch,
    update,
    remove,
    findQuotById
} = require('../biz/Customer');

module.exports = {
    url: '/textrade/api/customers/:id/quots/:quot',
    rests: [{
            type: 'read',
            ifNoneMatch,
            dataRef: {User: 'creator'},
            handler: (id, {quot}) => {return findQuotById(id, quot)}
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