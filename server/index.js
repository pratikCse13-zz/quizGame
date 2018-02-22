/** 
 * import npm modules
*/
var express = require('express')
var app = express()
var server = require('http').createServer(app)
var sticky = require('sticky-session')
var passport = require('passport')
var scheduler = require('node-schedule')

/**
 * import package modules
 */
var setup = require('./setup')
var routes = require('./routes')
var sockets = require('./sockets')
var loader = require('./loader')

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

//setup socket
var socketManager = sockets(server)

/**
 * schedule game loader
 */
scheduler.scheduleJob({hour: 20, minute: 55}, async ()=>{
    var loaderResults = await loader(socketManager)
})


  