const taskDb = require('../biz/batches/ImportPurTransTask');

const list = function (query) {
    var condi;
    try {
        condi = JSON.parse(query.q);
    } catch (e) {
        condi = {}
    }
    return taskDb.find(condi)
        .then(function (list) {
            return {
                items: list
            }
        })
};

module.exports = {
    url: '/cross/api/task/purTransTasks',
    rests: [{
            type: 'create',
            target: 'PurchaseTransTask',
            handler: taskDb.create
        },
        {
            type: 'query',
            element: 'PurchaseTransTask',
            handler: list
        }
    ]
}