const {
    ifMatch,
    ifNoneMatch,
    updateSubDoc,
    removeSubDoc,
    findSubDocById
} = require('../biz/Customer');

module.exports = {
    url: '/textrade/api/customers/:id/quots/:quot',
    transitions: {
        CustomerQuots: {id: 'params.customer', quot: 'context.id'}
    },
    rests: [{
            type: 'read',
            ifNoneMatch,
            dataRef: {Customer: 'Customer', User: 'creator'},
            handler: (id, {quot}) => {return findSubDocById(id, 'quots', quot)}
        },
        {
            type: 'update',
            ifMatch,
            handler: (id, data, {quot}) => {
                data.Customer = id
                data.id = quot
                return updateSubDoc('quots', data)
            }
        },
        {
            type: 'delete',
            handler: (id, {quot}) => {return removeSubDoc(id, 'quots', quot)}
        }
    ]
}