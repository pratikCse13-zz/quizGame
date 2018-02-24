const FacebookStrategy = require('passport-facebook').Strategy

const UserModel = require('../routes/user/model')
const authConfig = require('../config').auth

module.exports = async function(passport){
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        console.log('serializing user')
        done(null, user._id)
    })

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        console.log('deserializing user')
        User.findById(id, function(err, user) {
            done(err, user)
        })
    })

    passport.use(new FacebookStrategy({
        clientID: authConfig.facebook.clientId,
        clientSecret: authConfig.facebook.clientSecret,
        callbackURL: authConfig.facebook.callbackUrl,
        passReqToCallback: true
    },
    function(req, token, refreshToken, profile, done) {
        process.nextTick(async ()=>{
            // check if the user is already logged in
            if(!req.user) {
                console.log('user not logged in')
                try {
                    var user = await UserModel.findOne({ 'facebook.id' : profile.id })
                } catch(err) {
                    Helpers.notifyError(err, `Error while feching user object in login`)
                    return done(err)
                }
                if(user) {
                    console.log('new token for already registered user')
                    // if there is a user id already but no token (user was linked at one point and then removed)
                    if(!user.facebook.token) {
                        user.facebook.token = token
                        user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName
                        user.facebook.email = (profile.emails[0].value || '').toLowerCase()
                    }
                    try {
                        var user = await UserModel.save(user)
                    } catch(err) {
                        Helpers.notifyError(err, `Error while saving facebook token in user`)
                        return done(err)            
                    }
                    return done(null, user)
                } else {
                    console.log('registering user')
                    // if there is no user, create them
                    var newUser = new UserModel()
                    newUser.facebook.id = profile.id
                    newUser.facebook.token = token
                    newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName
                    newUser.facebook.email = (profile.emails[0].value || '').toLowerCase()
                    try {
                        var newUser = await UserModel.save(newUser)
                    } catch(err) {
                        Helpers.notifyError(err, `Error while creating new user in login`)
                        return done(err)
                    }
                    return done(null, newUser)
                }
            } else {
                console.log('linking facebook account')
                // user already exists and is logged in, we have to link accounts
                var user = req.user // pull the user out of the session
                user.facebook.id = profile.id
                user.facebook.token = token
                user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName
                user.facebook.email = (profile.emails[0].value || '').toLowerCase()

                try {
                    var user = await UserModel.save(user)
                } catch(err) {
                    Helpers.notifyError(err, `Error while saving facebook token in user`)
                    return done(err)            
                }
                return done(null, user)
            }
        })

    }))
}