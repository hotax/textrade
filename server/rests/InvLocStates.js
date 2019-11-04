const locStates = require('../biz/inv/Locs').listLocState;

module.exports = {
    url: '/cross/api/reports/inv/locStates',
    rests: [{
            type: 'get',
            handler: locStates
        }
    ]
}