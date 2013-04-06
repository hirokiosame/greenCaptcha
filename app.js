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
	database : 'green'
});

connection.connect(function(err) {
	if (err) console.log(err);
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

/**	http.get({
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
*/

//	res.send(geo);

	var question;

	// randomly pick a question type
	switch (Math.floor(Math.random() * 3) + 1)
	{
		case 1: // emissions by distance
			var distance = Math.floor(Math.random() * 10) + 1; // pick random distance in [0,10]
			var poundsOfCO2 = 423 * distance * 0.00220462; // 423g/mi * 0.00220462lb/g * n mi = lbs of CO2
			question = "A " + distance + "-mile trip in the average car produces " + Math.round(poundsOfCO2) + "lbs of CO2";
			console.log(question);
			break;
		case 2: // greenhouse gases by state
			var query = "SELECT * FROM greenhousegasses WHERE state='" + geo.region + "' ORDER BY RAND() LIMIT 0,1"; // pick random row from greenhouse gases table
			connection.query(query, function(err, rows, fields) {
				if (err) console.log(err);
				question = rows[0].state + " produced " + Math.round(rows[0].metricTons) + " metric tons of " + rows[0].gasName + " in " + rows[0].year + ".";
				console.log(question);
			});
			break;
		case 3: // drag 'n' drop
			question = "dragndrop";
			// TODO: ROMAN
			console.log(question);
			break;
		default:
			question = 'An error occurred.';
			console.log(question);
	}
		
	res.send('asdf');

});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


// utility functions

function getDistanceFromLatLon(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  d *= 0.6214; // Distance in miles
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

