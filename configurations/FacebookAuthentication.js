module.exports = function () {
    passport.use(new FacebookStrategy({
        clientID: configurationHolder.config.fbclientID,
        clientSecret: configurationHolder.config.fbclientSecret,
        callbackURL: configurationHolder.config.fbcallbackURL,
        profileFields: ['id', 'displayName', 'birthday', "first_name", "last_name", 'email']
    }, function (accessToken, refreshToken, profile, done) {
        profile.accessToken = accessToken;
        process.nextTick(function () {
            done(null, profile);
        });
    }));

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });

};

