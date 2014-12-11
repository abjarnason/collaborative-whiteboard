var express = require('express');
var socket = require('socket.io');

var app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.sendFile('index.html', { root: __dirname });
});

io.on('connection', function(socket){
	socket.on('pushLine', function(data){
		socket.broadcast.emit('broadcastLine', data);
	});
});

http.listen(8080, function(){
	console.log('running on port 8080');
});