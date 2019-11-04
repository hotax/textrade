const periodPurchases = require('../biz/pur/Purchases').periodPurchases

module.exports = {
    url: '/cross/api/reports/pur/periodPurchases',
    rests: [{
        type: 'get',
        handler: periodPurchases
    }]
};