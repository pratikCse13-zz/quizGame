var passport = require('passport')
var FacebookStrategy = require('passport-facebook').Strategy

var UserModel = require('../routes/user/model')
var authConfig = require('../config').auth

module.exports = function(){
    passport.use(new FacebookStrategy({
        clientID: authConfig.facebook.clientId,
        clientSecret: authConfig.facebook.clientSecret,
        callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
        UserModel.findOrCreate({ facebookId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }))
}