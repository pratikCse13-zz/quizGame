/** 
 * import npm modules
*/
var mongoose = require('mongoose')

/**
 * import package modules
 */
var config = require('../config')

module.exports = ()=>{
	console.log('process.argv[1]')
	console.log(process.argv[1])
	mongoose.connect(config.mongo.url)
}