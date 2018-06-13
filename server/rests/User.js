const Users = require('../db/users'),
    logger = require('@finelets/hyper-rest/app/Logger');

const sendUserInfo = function (req, res) {
    const {
        user
    } = req.cookies;
    return Users.getById(user)
        .then(function (data) {
            var result = data ? {
                id: data.gitProfile.id,
                profile: data.gitProfile,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            } : null;
            logger.info('The user in request:' + JSON.stringify(result));
            return res.json(result);
        })
}

const handle = function (req, res) {
    if (!req.cookies.user) {
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