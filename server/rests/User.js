const Users = require('../db/users'),
    logger = require('@finelets/hyper-rest/app/Logger');

const sendUserInfo = function (req, res) {
    const {
        user
    } = req;
    var result = {
        id: user.gitProfile.id,
        profile: user.gitProfile,
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
    };
    res.json(result);
}

const handle = function (req, res) {
    if (!req.user) {
        logger.info('The user in request is null');
        res.send('null');
    } else {
        sendUserInfo(req, res);
    }
}

module.exports = {
    url: '/api/user',
    rests: [{
        type: 'get',
        handler: handle
    }]
};