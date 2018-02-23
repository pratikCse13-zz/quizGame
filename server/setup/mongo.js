/** 
 * import npm modules
*/
var mongoose = require('mongoose')

/**
 * import package modules
 */
var config = require('../config')

module.exports = ()=>{
	mongoose.connect(config.mongo.url)
}