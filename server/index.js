/** 
 * import npm modules
*/
var express = require('express')
var app = express()
var server = require('http').createServer(app)
var sticky = require('sticky-session')

/**
 * import package modules
 */
var setup = require('./setup')
var routes = require('./routes')
var sockets = require('./sockets')

//setup routes
app.use(routes)

//setup sticky sessions
setup.stickySessions(server)

//setup mongo
setup.mongo()

//setup socket
sockets(server)


  