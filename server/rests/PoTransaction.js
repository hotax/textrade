
const entity = require('../biz/pur/Purchases');

module.exports = {
    url: '/cross/api/pur/purchases/:parent/transactions/:id',
    rests: [{
            type: 'read',
            dataRef: {User: 'actor'},
            handler: (id, args) => {
                return entity.findSubDocById(args.parent, 'transactions', args.id)
            }
        }
    ]
}