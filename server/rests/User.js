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
        logger.debug('The user in request is null, because the user does not login!');
        res.send('null');
    } else {
        logger.debug('The use already login');
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