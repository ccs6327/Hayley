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

			console.log(rows);
		})
	},

	addUser: function (name, phone_no, callback) {
		var query = "INSERT INTO users (user, phone) values (";

		query = query + "'" + name + "', '" + phone_no + "');";
		console.log(query);
		con.query(query, function (err, rows) {
			if (err) throw err;

			callback(rows);
		})
	}
}