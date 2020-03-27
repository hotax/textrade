const entity = require('../biz/Customer')

const list = function (query) {
    // TODO: 使listSubs具有按条件过滤和文本收索的能力id
    return entity.listRequirements(query.id)
        .then(function (list) {
            return {
                items: list
            }
        })
}

module.exports = {
    url: '/textrade/api/customers/:id/requirements',
    transitions: {
        CustomerRequirement: {id: 'context.customer'}
    },
    rests: [{
            type: 'create',
            target: 'CustomerRequirement',
            handler: (req) => {
                return entity.createRequirement(req.params['id'], req.body)
            }
        },
        {
            type: 'query',
            element: 'CustomerRequirement',
            handler: list
        }
    ]
}