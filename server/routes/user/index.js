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

module.exports = router