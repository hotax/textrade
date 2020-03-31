/**
 * Created by clx on 2017/10/13.
 */
const {ifMatch, ifNoneMatch, update, remove, findById} = require('../biz/Product')

module.exports = {
    url: '/textrade/api/products/:id',
    transitions: {
        ProductChain: {id: 'context.product'},
        ProductChains: {id: 'params.id'},
        ProductChainPart: {id: 'context'},
        ProductChainPartQuot: {id: 'context.product'}
    },
    rests: [{
            type: 'read',
            ifNoneMatch,
            dataRef: {User: 'creator'},
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