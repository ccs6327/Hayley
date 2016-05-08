var mysql = require('mysql');
var con = mysql.createConnection({
  host     : 'jackdb.cdj8ie7hn84a.us-west-2.rds.amazonaws.com',
  user     : 'jackong93',
  password : 'jackong93',
  database : 'hayley'
});

con.connect(function (err) {
	if (err) {
		console.error("error connecting: " + err.stack);
		return;
	}
})

module.exports = {
	listUser: function () {
		con.query("select * from users", function(err, rows) {
			if (err) throw err;

			console.log("get users success.");
		})
	},

	addUser: function (name, phone_no, callback) {
		var addUserQuery = "INSERT INTO users (user, phone) values (";

		addUserQuery = addUserQuery + "'" + name + "', '" + phone_no + "');";
		
		con.query(addUserQuery, function (err, rows) {
			if (err) throw err;

			callback("add user success.");
		})
	},

	getResponse: function (callback) {
		var responseQuery = "select r.id response_id \
				, u.id user_id \
				, u.user username \
			    , u.phone phone_no \
			    , q.id question_id \
			    , q.question question \
			    , r.response \
			from responses r  \
			left join users u on u.id = r.user_id \
			left join questions q on q.id = r.question_id \
			order by q.id desc, r.id desc";

		con.query(responseQuery, function (err, rows) {
			if (err) throw err;

			console.log("get response success.");

			callback(rows);
		})
	}
}