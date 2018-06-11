const passport = require('passport'),
    auth = passport.authenticate('github');

module.exports = {
    url: '/api/auth/github',
    rests: [{
        type: 'get',
        handler: auth
    }]
};