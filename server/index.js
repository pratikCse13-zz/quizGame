/** 
 * import npm modules
*/
var express = require('express')
var app = express()
var server = require('http').createServer(app)
var sticky = require('sticky-session')
var passport = require('passport')
var scheduler = require('node-schedule')
var expressSession = require('express-session')
var MongoStore = require('connect-mongo')(expressSession)

/**
 * import package modules
 */
var setup = require('./setup')
var routes = require('./routes')
var sockets = require('./sockets')
var loader = require('./GameLoader')
var config = require('./config')

require('./auth/facebook')(passport)
require('./auth/kakao')(passport)

app.use(passport.initialize())
app.use(passport.session())

// send to facebook to do the authentication
app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['public_profile', 'email'] }));
app.get('/auth/kakao', passport.authenticate('kakao', { scope : ['public_profile', 'email'] }));

// handle the callback after facebook has authenticated the user
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/'
    })
)

//setup routes
app.use(routes)


//setup sticky sessions
setup.stickySessions(server)

//setup mongo
setup.mongo()

var sessionStore = new MongoStore({
    url: config.mongo.url,
    autoRemove: 'native' 
})

//setup session
var session = expressSession({
    secret: config.session.sessionSecretKey,
    resave: false,
    saveUninitialized: false,
    store: sessionStore, 
    cookie: {
        //httpOnly: true, // when true, cookie is not accessible from javascript 
        //secure: false, // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process 
        maxAge: config.session.sessionDuration
    }
})

app.use(session);

//setup socket
var socketManager = sockets(server, passport, sessionStore)

/**
 * schedule game loader
 */
scheduler.scheduleJob({hour: 20, minute: 55}, async ()=>{
    var loaderResults = await loader(socketManager)
})


  