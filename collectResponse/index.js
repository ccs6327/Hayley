var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'jackdb.cdj8ie7hn84a.us-west-2.rds.amazonaws.com',
  user     : 'jackong93',
  password : 'jackong93',
  database : 'hayley'
});

exports.handler = function(event, context) {
  	var body = event.body;
  	var responder = event.from;
  	
  	connection.connect(function (err) {
  		if (err) {
  			console.log('connect to db with err ' + err);
  			return;
  		}
  	});

  	connection.query("SELECT id FROM users WHERE phone = " + responder
  		, function(err, rows, field) {
  			if (err) {
  				console.log('get user id with err ' + err);
  				return;
  			}
  			var userId = rows[0].id;
  			console.log("***user id is " + userId);
  			var trimmedAndLowercaseMsg = body.toLowerCase().trim();
  			if (trimmedAndLowercaseMsg !== "yes" && trimmedAndLowercaseMsg !== "no" &&
  				trimmedAndLowercaseMsg !== "y" && trimmedAndLowercaseMsg !== "n") {
  				context.done(null, {body:"<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response><Message>Please reply YES or NO</Message></Response>"});
	  			return;
  			}

  			var response = body.toLowerCase() === "yes" || body.toLowerCase() === 'y';

  			connection.query("SELECT * FROM questions where id=(SELECT max(id) FROM questions)"
  				, function(err, rows, field) {
  					console.log("get row from max id");
  					var questionId = rows[0].id;
  					console.log("question id is " + questionId);

  					connection.query('SELECT * FROM responses where user_id =' + userId + ' AND question_id = ' + questionId,
  						function(err, rows, field) {
  							console.log("get if entry is existed");
  							console.log(rows);
  							if (rows.length > 0) {
  								context.done(null, {body:"<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>"});
  								return;
  							}

  							connection.query('INSERT INTO responses (user_id, question_id, response) VALUES (' + userId + ',' + questionId + ',' + response + ')'
  								, function(err, rows, field) {
  								if (err) throw err;
  								console.log('The result is: ');
  								console.log(rows[0]);
  								context.done(null, {body:"<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response><Message>Thank you for RSVP!</Message></Response>"});
  							});
  						});

  				});
  		});
};