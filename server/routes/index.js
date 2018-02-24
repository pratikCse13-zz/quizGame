/**
 * import npm packages
 */
const passport = require('passport')
const router = require('express').Router()

/**
 * import package modules
 */
const authMiddlewares = require('../middlewares').auth

router.use('/question', require('./question'))
router.use('/game', require('./game'))
router.use('/user', require('./user'))

module.exports = router;
