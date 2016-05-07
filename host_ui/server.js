// setting up
var db = require('./database/database.js');
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

// configurations
app.use(express.static(__dirname + '/'));// set the static files location /pages/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({'extended': 'true'})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({type: 'application/vnd.api+json'})); // parse application/vnd.api+json as json
app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request

// routes
// to get list of questions
app.post('/apis/addUser', function (req, res) {
	console.log(req.body);
	var name = req.body.name;
	var phone = req.body.phone;
	db.addUser(name, phone, function (data) {
		console.log(data);
	})
})


// application
app.get('*', function (req, res) {
	db.listUser();
	res.sendfile(__dirname + '/pages/index.html')
})

app.listen(port);	