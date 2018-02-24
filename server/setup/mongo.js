/** 
 * import npm modules
*/
const mongoose = require('mongoose')

/**
 * import package modules
 */
const config = require('../config')

module.exports = ()=>{
	mongoose.connect(config.mongo.url)
}