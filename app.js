var express = require('express'),
	routes = require('./routes'),
	http = require('http'),
	fs = require('fs'),
	path = require('path'),
	mysql = require('mysql'),
	geoip = require('geoip-lite');
	//Canvas = require('canvas');

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
	res.header("Content-Type", "text/javascript");
	var ip = req.header('x-forwarded-for') || req.ip;

	//Demo Mode
		ip = "128.197.230.201";

	var geo = geoip.lookup(ip);


	var question, response = '';
	var random = Math.floor(Math.random() * 3) + 1;

	//Randomly pick a question type
	switch( 3 ){
		case 1: // emissions by distance
			var distance = Math.floor(Math.random() * 10) + 1; // pick random distance in [0,10]
			var poundsOfCO2 = 423 * distance * 0.00220462; // 423g/mi * 0.00220462lb/g * n mi = lbs of CO2
			question = "A " + distance + "-mile trip in the average car produces " + Math.round(poundsOfCO2) + "lbs of CO2";
			console.log(question);
			response += "window.input = { ";
			response += "	id : '',";
			response += "	imgPath :'" + draw.drawSentence(question) + "',";
			response += "	type : 'fact'";
			response += "}; ";
			
			fs.readFile(path.join(__dirname, 'public', 'js', 'captcha.js'), function(err, data) {
				if (err) console.log(err);
				response += data;
				res.send(response);	
			});
			
			break;
		case 2: // greenhouse gases by state
			var query = "SELECT * FROM greenhousegasses WHERE state='" + geo.region + "' ORDER BY RAND() LIMIT 0,1"; // pick random row from greenhouse gases table
			connection.query(query, function(err, rows, fields) {
				if (err) console.log(err);
				question = rows[0].state + " produced " + Math.round(rows[0].metricTons) + " metric tons of " + rows[0].gasName + " in " + rows[0].year + ".";
				console.log(question);
				response += "window.input = { ";
				response += "	id : '',";
				response += "	imgPath :'" + draw.drawSentence(question) + "',";
				response += "	type : 'fact'";
				response += "}; ";

				fs.readFile(path.join(__dirname, 'public', 'js', 'captcha.js'), function(err, data) {
					if (err) console.log(err);
					response += data;
					res.send(response);	
				});
			});
			break;
		case 3: // drag 'n' drop
			question = "dragndrop";
			// TODO: ROMAN
			console.log(question);
			res.send(question);
			break;
		default:
			question = 'An error occurred.';
			console.log(question);
			res.send(question);
	}
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});






// utility functions
/*
	GOWTAM: call draw.drawSentence(here goes your string)
*/

var draw = {};
draw.drawSentence = function (sentence) {
	
	var canvas = new Canvas(300,80),
	tokens = sentence.split(' '),
	w1 = Math.floor(Math.random()*tokens.length),
	w2 = Math.floor(Math.random()*tokens.length),
	ctx = canvas.getContext('2d');
	
	ctx.font = '12px Times';
	ctx.beginning = 20;
	ctx.fontSize = 12;
	ctx.width = canvas.width;


	while (w2 === w1) {
	w2 = Math.floor(Math.random()*tokens.length);
	}

	//go thru words
	var i = 0,
	position = [ctx.beginning,20];

	while (tokens[i] !== undefined) {
		console.log("word : " + i+"@ (x,y)(" + position[0]+ ")("+position[1]+")");
		position = this.drawWord(tokens[i],position[0],position[1],(i === w1 || i === w2),ctx);
		i++;
	}

	ctx.rotate(0.2);

	return [canvas.toDataURL(),tokens[w1],tokens[w2]; // returns base64 img png
}

// input word, x,y; return final x,y,length
draw.drawWord = function (word,x,y,distortC,ctx) {
	var w = ctx.measureText(word);
	if (w.width + x > ctx.width) {
		x = ctx.beginning;
		y += ctx.fontSize + 5;
	}

	ctx.fillText(word, x, y);
	
	if (distortC) {
		this.distort(x,y,w.width,ctx);
	}

	x += w.width + 5;

	return [x,y];
}

draw.distort = function(x,y,width,ctx) {

	// Add random lines
	for (var i = 0, lim =  Math.floor(Math.random() * 5 + 3); i < lim; i++) {
		ctx.strokeStyle = 'rgba(' + this.rndC() + ',' + this.rndC() + ',' + this.rndC() + ',0.7)';
		ctx.lineWidth = Math.floor(Math.random() * 2 + 1);
		ctx.beginPath();
		ctx.lineTo(x + Math.floor(Math.random() * width), y + Math.floor(Math.random() * ctx.fontSize) - 10);
		ctx.lineTo(x + Math.floor(Math.random() * width), y + Math.floor(Math.random() * ctx.fontSize) - 10);
		ctx.stroke();
	}

}

draw.rndC = function () {
	return Math.floor(Math.random() * 100) + 50;
}
draw.create = function(){

}
