/**
 * Created by clx on 2017/10/13.
 */
const {ifMatch, ifNoneMatch, update, remove, findById} = require('../biz/Part')

module.exports = {
    url: '/textrade/api/parts/:id',
    transitions: {
        PartQuot: {id: 'context.part'},
        ProductChainPart: {id: 'context'}
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