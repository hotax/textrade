const passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    logger = require('@finelets/hyper-rest/app/Logger'),
    Users = require('./db/users');

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true,
        proxy: true
    },
    function (accessToken, refreshToken, profile, done) {
        logger.info('accessToken:' + accessToken);
        logger.info('refreshToken:' + refreshToken);
        logger.info('profile:' + JSON.stringify(profile));
        return Users.findOrCreate({
                profile: {
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
    logger.info('serialize user:' + JSON.stringify(user));
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    return Users.getById(id)
        .then(function (user) {
            const err = !user ? new Error('User not found') : null
            done(err, user || null)
        })
});


module.exports = passport;