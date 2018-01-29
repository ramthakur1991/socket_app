/**
 * Module dependencies.
 */
var express = require("express"),
	bodyParser = require('body-parser'),
	path = require("path"),
	app = express(),
	router = express.Router(),
	config = require('./config/local');
	require('./routes')(router);
	
app.use(express.static(path.join(__dirname,'assets')));
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');
app.engine('.html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));

//server settings
app.use('/',router);
app.listen(config.port, function(){
	console.log("Server listening at http://localhost: "+config.port);
});

var server = require('http').createServer(app) ,
	sockets = require('socket.io')(server);
	require('./socket')(sockets);
	server.listen(config.socketPort, function(){
		console.log("Socket server listening at ws://localhost:"+config.socketPort);
	});

