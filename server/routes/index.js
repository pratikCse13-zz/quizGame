/**
 * import npm packages
 */
var router = require('express').Router()

router.use('/question', require('./question'))
router.use('/game',     require('./game'))

module.exports = router;
