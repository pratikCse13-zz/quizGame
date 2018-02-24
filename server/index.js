/** 
 * import npm modules
*/
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const sticky = require('sticky-session')
const passport = require('passport')
const scheduler = require('node-schedule')
const expressSession = require('express-session')
const MongoStore = require('connect-mongo')(expressSession)
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

/**
 * import package modules
 */
const setup = require('./setup')
const routes = require('./routes')
const sockets = require('./sockets')
const loader = require('./GameLoader')
const config = require('./config')
const authMiddlewares = require('./middlewares').auth

app.use(express.static('views'))
app.set('view engine', 'pug')
app.get('/', (req, res)=>{
    res.render('index')
})

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser())

//setup mongo
setup.mongo()
//setup redis 
var redisClient = setup.redis()

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

app.use(session)
require('./auth/facebook')(passport)
require('./auth/kakao')(passport)
app.use(passport.initialize())
app.use(passport.session())

//setup routes
app.use(routes)

app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['public_profile', 'email'] }), authMiddlewares.regenerateSession)
app.get('/auth/kakao', passport.authenticate('kakao', { scope : ['public_profile', 'email'] }), authMiddlewares.regenerateSession)

// handle the callback after facebook has authenticated the user
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect : '/',
        failureRedirect : '/'
    })
)

//setup socket
var socketManager = sockets(server, passport, sessionStore, redisClient)

/**
 * schedule game loader
 */
scheduler.scheduleJob({hour: 20, minute: 55}, async ()=>{
    var loaderResults = await loader(socketManager, redisClient)
})

//setup sticky sessions
setup.stickySessions(server)



  