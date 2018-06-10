const passport = require('passport'),
    logger = require('@finelets/hyper-rest/app/Logger');

const auth = passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login'],
    display: 'popup'
});

module.exports = {
    url: '/api/auth/google',
    rests: [{
        type: 'get',
        handler: auth
    }]
};