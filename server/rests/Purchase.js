/**
 * Created by clx on 2017/10/13.
 */
const entity = require('../biz/pur/Purchases') 
const { ifMatch, ifNoneMatch, update, remove, findById } = entity

module.exports = {
    url: '/cross/api/pur/purchases/:id',
    transitions: {
        PoTransaction: {id: 'params.parent'}
    },
    rests: [{
            type: 'read',
            ifNoneMatch,
            dataRef: {Part: 'part', Supplier: 'supplier', User: ['applier', 'creator', 'reviewer']},
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
        },
        {
            type: 'create',
            target: 'PoTransaction',
            handler: (req) => {
                const id = req.params['id']
                const type = req.query['type']
                return entity.doTransaction(id, type, req.body)
            }
        }
    ]
}