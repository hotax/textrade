/**
 * Created by clx on 2017/10/13.
 */
const entity = require('../biz/inv/Withdraws')
const { ifNoneMatch, findById } = entity

module.exports = {
    url: '/cross/api/inv/withdraw/:id',
    rests: [{
            type: 'read',
            ifNoneMatch,
            dataRef: {Part: 'part', User: 'actor'},
            handler: findById
        }
    ]
}