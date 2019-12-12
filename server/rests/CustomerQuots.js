const entity = require('../biz/Customer')

const list = function (query) {
    // TODO: 使listSubs具有按条件过滤和文本收索的能力
    return entity.listSubs(query.customer, 'quots')
        .then(function (list) {
            return {
                items: list
            }
        })
}

module.exports = {
    url: '/textrade/api/customers/:customer/quots',
    transitions: {
        Customer: {customer: 'params.id'},
        CustomerQuot: {customer: 'params.id'}
    },
    rests: [{
            type: 'create',
            target: 'CustomerQuot',
            handler: (req) => {
                return entity.createSubDoc(req.params['customer'], 'quots', req.body)
            }
        },
        {
            type: 'query',
            element: 'CustomerQuot',
            handler: list
        }
    ]
}