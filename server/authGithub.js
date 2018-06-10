const passport = require('passport'),
    GithubStrategy = require('passport-github').Strategy,
    logger = require('@finelets/hyper-rest/app/Logger'),
    Users = require('./db/users');

passport.use(new GithubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, done) {
        logger.info('accessToken:' + accessToken);
        logger.info('refreshToken:' + refreshToken);
        logger.info('profile:' + JSON.stringify(profile));
        return done(null, profile)
    }));

passport.serializeUser(function (user, done) {
    logger.info('serialize user:' + JSON.stringify(user));
    done(null, user);
})

passport.deserializeUser(function (obj, done) {
    logger.info('deserialize user:' + obj);
    done(null, obj)
})

module.exports = passport;