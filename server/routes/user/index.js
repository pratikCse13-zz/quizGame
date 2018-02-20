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
router.post('/login', passport.authenticate('facebook-token', { session: false }),
    function(req, res) {
        console.log('req.user')
        console.log(req.user)
        // Successful authentication, redirect home. 
        return res.send({a: 'yay'})
    }
);

module.exports = router