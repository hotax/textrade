const entity = require('../biz/inv/Withdraws');

const list = function (query) {
    let condi
    try {
        condi = JSON.parse(query.q);
    } catch (e) {
        condi = {}
    }
    /* let text = query.s ? query.s : '.'
    text = text.length > 0 ? text : '.'
    return entity.search(condi, text) */
    return entity.search(condi)
        .then(function (list) {
            return {
                items: list
            }
        })
};

module.exports = {
    url: '/cross/api/inv/withdraws',
    rests: [{
            type: 'create',
            target: 'Withdraw',
            handler: (req) => {
                return entity.create(req.body)
            }
        },
        {
            type: 'query',
            element: 'Withdraw',
            handler: list
        }
    ]
}