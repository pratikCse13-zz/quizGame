var KakaoStrategy = require('passport-kakao').Strategy

var UserModel = require('../routes/user/model')
var authConfig = require('../config').auth

module.exports = async function(passport){
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id)
    })

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user)
        })
    })

    passport.use(new KakaoStrategy({
        clientID: authConfig.kakao.clientId,
        clientSecret: authConfig.kakao.clientSecret,
        callbackURL: authConfig.kakao.callbackUrl,
        passReqToCallback: true
    },
    function(req, token, refreshToken, profile, done) {
        process.nextTick(async ()=>{
            // check if the user is already logged in
            if(!req.user) {
                try {
                    var user = await UserModel.findOne({ 'kakao.id' : profile.id })
                } catch(err) {
                    Helpers.notifyError(err, `Error while feching user object in login`)
                    return done(err)
                }
                if(user) {
                    // if there is a user id already but no token (user was linked at one point and then removed)
                    if(!user.kakao.token) {
                        user.kakao.token = token
                        user.kakao.name  = profile.name.givenName + ' ' + profile.name.familyName
                        user.kakao.email = (profile.emails[0].value || '').toLowerCase()
                    }
                    try {
                        var user = await UserModel.save(user)
                    } catch(err) {
                        Helpers.notifyError(err, `Error while saving kakao token in user`)
                        return done(err)            
                    }
                    return done(null, user)
                } else {
                    // if there is no user, create them
                    var newUser = new UserModel()
                    newUser.kakao.id = profile.id
                    newUser.kakao.token = token
                    newUser.kakao.name = profile.name.givenName + ' ' + profile.name.familyName
                    newUser.kakao.email = (profile.emails[0].value || '').toLowerCase()
                    try {
                        var newUser = await UserModel.save(newUser)
                    } catch(err) {
                        Helpers.notifyError(err, `Error while creating new user in login`)
                        return done(err)
                    }
                    return done(null, newUser)
                }
            } else {
                // user already exists and is logged in, we have to link accounts
                var user = req.user // pull the user out of the session
                user.kakao.id = profile.id
                user.kakao.token = token
                user.kakao.name = profile.name.givenName + ' ' + profile.name.familyName
                user.kakao.email = (profile.emails[0].value || '').toLowerCase()

                try {
                    var user = await UserModel.save(user)
                } catch(err) {
                    Helpers.notifyError(err, `Error while saving kakao token in user`)
                    return done(err)            
                }
                return done(null, user)
            }
        })

    }))
}