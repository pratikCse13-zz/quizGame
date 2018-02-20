/**
 * import npm modules
 */
var router = require('express').Router()
var passport = require('passport')
/**
 * import package modules
 */
var User = require('./User')

router.get('/allUsers', User.getAll)
router.post('/login', passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home. 
        return res.send({a: 'yay'})
    }
);

module.exports = router