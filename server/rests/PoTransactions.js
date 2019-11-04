const entity = require('../biz/pur/Purchases') 

const list = function (query) {
    const {id} = query
    return entity.listSubs(id, 'transactions')
        .then(function (list) {
            return {
                items: list
            }
        })
}

module.exports = {
    url: '/cross/api/pur/purchases/:id/transactions',
    rests: [{
            type: 'create',
            target: 'PoTransaction',
            handler: (req) => {
                const id = req.params['id']
                const type = req.query['type']
                return entity.doTransaction(id, type, req.body)
            }
        },
        {
            type: 'query',
            element: 'PoTransaction',
            handler: list
        }
    ]
}