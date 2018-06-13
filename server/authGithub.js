const passport = require('passport'),
    GithubStrategy = require('passport-github2').Strategy,
    logger = require('@finelets/hyper-rest/app/Logger'),
    Users = require('./db/users');

passport.use(new GithubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        passReqToCallback: true
    },
    function (req, accessToken, refreshToken, profile, done) {
        logger.debug('using github auth strategy, already obtain github auth!:');
        logger.debug('accessToken:' + accessToken);
        logger.debug('profile:' + JSON.stringify(profile));
        return Users.findOrCreate({
                gitProfile: {
                    id: profile.id,
                    displayName: profile.displayName,
                    photos: profile.photos,
                },
                accessToken,
                refreshToken,
            })
            .then(function (user) {
                return done(null, user);
            })
            .catch(function (e) {
                return done(e);
            })
    }));

passport.serializeUser(function (user, done) {
    logger.debug('serialize userId:' + user.gitProfile.id);
    return done(null, user.gitProfile.id);
})

passport.deserializeUser(function (id, done) {
    logger.debug('deserialize userId:' + id);
    return Users.getById(id)
        .then(function (user) {
            return done(null, user);
        })
        .catch(function (e) {
            return done(e);
        })
})

module.exports = passport;