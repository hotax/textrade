const entity = require('../biz/Product');

// TODO: 构建一个典型的搜索查询服务的handler
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
    url: '/textrade/api/products',
    rests: [{
            type: 'create',
            target: 'Product',
            handler: (req) => {
                return entity.create(req.body)
            }
        },
        {
            type: 'query',
            element: 'Product',
            handler: list
        }
    ]
}