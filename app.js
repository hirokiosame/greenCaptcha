var express = require('express'),
	routes = require('./routes'),
	user = require('./routes/user'),
	http = require('http'),
	path = require('path'),
	mysql = require('mysql'),
	geoip = require('geoip-lite');

var connection = mysql.createConnection({
	host     : '198.74.61.157',
	user     : 'green',
	password : 'green',
});

connection.connect(function(err) {
	console.log(err);
});


/*

connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
  if (err) throw err;

  console.log('The solution is: ', rows[0].solution);
});

connection.end();

*/

var app = express();

// all environments
app.set('port', process.env.PORT || 3002);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

app.get('/greencaptcha.js', function(req, res){
	var ip = req.header('x-forwarded-for') || req.ip;
		ip = "128.197.230.201";

	var geo = geoip.lookup(ip);
	console.log(geo);

	http.get({
		host: "explore.data.gov",
		port: 80,
		path: "/resource/t6sb-8txz.json?state="+geo.region+"&year=2010",
	}, function(res) {
		var page = "";
		res.setEncoding("utf8");
		res.on("data", function(data){
			page += data;
		}).on("end", function(){

			data = JSON.parse(page);
			console.log(data);
		});
	}).on('error', function(e) {
		console.log("Got error: " + e.message);
	}).end();

	res.send(geo);

});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
