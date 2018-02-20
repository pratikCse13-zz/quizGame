var passport = require('passport')
var FacebookStrategy = require('passport-facebook-token')

var UserModel = require('../routes/user/model')
var authConfig = require('../config').auth

module.exports = function(){
    passport.use(new FacebookStrategy({
        clientID: authConfig.facebook.clientId,
        clientSecret: authConfig.facebook.clientSecret,
        callbackURL: authConfig.facebook.callbackUrl
    },
    function(accessToken, refreshToken, profile, cb) {
        // UserModel.findOrCreate({ facebookId: profile.id }, function (err, user) {
        //     return cb(err, user);
        // });
        UserModel.upsertFbUser(accessToken, refreshToken, profile, function(err, user) {
            return cb(err, user);
        });
        // console.log('inside facebook strategy')
        // return cb(null, {a: 1})
    }))

    passport.serializeUser(function(user, cb) {
        console.log('inside serializer')
        cb(null, user);
    });
    
    passport.deserializeUser(function(obj, cb) {
        console.log('inside de-serializer')
        
        cb(null, obj);
    });
}