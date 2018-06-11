const logger = require('@finelets/hyper-rest/app/Logger');

const sendUserInfo = function (req, res) {
    const {
        user
    } = req
    res.json({
        id: user.gitProfile.id,
        profile: user.gitProfile,
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
    });
}

const handle = function (req, res) {
    if (!req.user) {
        logger.info('The user in request is null');
        res.send('null');
    } else {
        logger.info('The user in request:' + JSON.stringify(req.user));
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