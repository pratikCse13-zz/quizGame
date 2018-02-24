/**
 * import npm packges
 */
const sticky = require('sticky-session')

module.exports = (server)=>{
	if(!sticky.listen(server, 3000)){
		server.once('listening', function() {
			console.log(`server started on 3000 port on process - ${process.pid}`)
		});
	} else {
		console.log(`server started on 3000 port on process - ${process.pid}`)
	}
}
