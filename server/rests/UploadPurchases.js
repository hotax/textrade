const PurchasesCSVStream = require('../biz/batches/PurchasesCSVStream');

module.exports = {
    url: '/cross/api/purchases/csv',
    rests: [{
        type: 'upload',
        handler: PurchasesCSVStream
    }]
}