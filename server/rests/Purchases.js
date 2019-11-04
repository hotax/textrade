const entity = require('../biz/pur/Purchases');

const list = function (query) {
    let condi
    try {
        condi = JSON.parse(query.q);
    } catch (e) {
        condi = {}
    }
    let text = query.s ? query.s : '.'
    text = text.length > 0 ? text : '.'
    return entity.search(condi, text)
        .then(function (list) {
            return {
                items: list
            }
        })
};

module.exports = {
    url: '/cross/api/pur/purchases',
    rests: [{
            type: 'create',
            target: 'Purchase',
            handler: (req) => {
                return entity.create(req.body)
            }
        },
        {
            type: 'query',
            element: 'Purchase',
            handler: list
        }
    ]
}