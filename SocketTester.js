console.log('1');

// Connect to server
var io = require('socket.io-client')
var socket = io.connect('http://localhost:3000', {reconnect: true});

console.log('2');

// Add a connect listener
socket.on('connect', function(socket) {
    console.log('Connected!');

    socket.emit('getRealTimePlayerCount', {

    })
})

socket.on('pinge', (data)=>{
    console.log(`Server pinged: ${data.message}`)
})

console.log('3');