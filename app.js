var express = require('express'),
routes = require('./routes'),
user = require('./routes/user'),
http = require('http'),
fs = require('fs'),
path = require('path'),
mysql = require('mysql'),
geoip = require('geoip-lite'),
crypto = require('crypto'),
Canvas = require('./node_modules/canvas');

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

app.get('/', function(req, res){
	res.sendfile('./routes/index.html');
});

app.get('/greencaptcha.js', function(req, res){
	var reload = req.query["reload"];
	res.header("Content-Type", "text/javascript");
	var ip = req.header('x-forwarded-for') || req.ip;

	//Demo Mode
		ip = "128.197.230.201";

	var geo = geoip.lookup(ip);


	var question, response = '';
	var random = Math.floor(Math.random() * 3) + 1;


	//Randomly pick a question type
	switch( random ){
		case 1: // emissions by distance
			var distance = Math.floor(Math.random() * 10) + 1; // pick random distance in (0,10]
			var poundsOfCO2 = 423 * distance * 0.00220462; // 423g/mi * 0.00220462lb/g * n mi = lbs of CO2
			question = "A " + distance + "-mile trip in the average car produces " + Math.round(poundsOfCO2) + "lbs of CO2";
			console.log(question);
			var drawWords = draw.drawSentence(question);
			var answerHash = crypto.createHash('md5').update(drawWords[1] + " " + drawWords[2]).digest('hex');
			var save = "INSERT INTO challenges (answer) VALUES ('" + answerHash + "')";
			connection.query(save, function(err, info) {
				if (err) console.log(err);
				var id = info.insertId;

				var input = { id: id, data: drawWords[0], type: 'fact' };
				input = JSON.stringify(input);
				if (!reload)
					response += "window.input = ";

				response += input;

				if (!reload) {
					fs.readFile(path.join(__dirname, 'public', 'js', 'captcha.js'), function(err, data) {
						if (err) console.log(err);
						response += data;
						// TODO: concatenate captcha.js to var response.
						res.send(response);	
					});
				} else {
					res.setHeader('Content-Type', 'application/json');
					res.jsonp(response);
				}
			});
			break;
		case 2: // greenhouse gases by state
			var query = "SELECT * FROM greenhousegasses WHERE state='" + geo.region + "' ORDER BY RAND() LIMIT 0,1"; // pick random row from greenhouse gases table
			connection.query(query, function(err, rows, fields) {
				if (err) console.log(err);
				question = rows[0].state + " produced " + Math.round(rows[0].metricTons) + " metric tons of " + rows[0].gasName + " in " + rows[0].year;
				console.log(question);
				var drawWords = draw.drawSentence(question);
				var answerHash = crypto.createHash('md5').update(drawWords[1] + " " + drawWords[2]).digest('hex');
				var save = "INSERT INTO challenges (answer) VALUES ('" + answerHash + "')";
				connection.query(save, function(err, info) {
					if (err) console.log(err);
					var id = info.insertId;

					var input = { id: id, data: drawWords[0], type: 'fact' };
					input = JSON.stringify(input);
					if (!reload)
						response += "window.input = ";

					response += input;

					if (!reload) {
						fs.readFile(path.join(__dirname, 'public', 'js', 'captcha.js'), function(err, data) {
							if (err) console.log(err);
							response += data;
							// TODO: concatenate captcha.js to var response.
							res.send(response);	
						});	
					} else {
						res.setHeader('Content-Type', 'application/json');
						res.jsonp(response);
					}
				});
			});
			break;
		case 3: // drag 'n' drop
			question = "dragndrop";
			var availableBins = ['binBC.png', 'binPaper.png', 'binCompost.png', 'binLandfill.png'];
			var randomBin = availableBins[Math.floor(Math.random() * 4)]; // pick a random bin
			console.log(randomBin);
			// now let's figure out the valid and invalid items for the bin we chose
			var availableValidItems;
			var availableInvalidItems;
			switch (randomBin) {
				case 'binBC.png':
					availableValidItems = ['plasticbottle.png', 'can.png', 'glassbottle.png'];
					availableInvalidItems = ['paper.png', 'box.png', 'pizza.png', 'burger.png', 'chips.png', 'lightbulb.png'];
					break;
				case 'binPaper.png':
					availableValidItems = ['paper.png', 'box.png'];
					availableInvalidItems = ['plasticbottle.png', 'can.png', 'glassbottle.png', 'pizza.png', 'burger.png', 'chips.png', 'lightbulb.png'];
					break;
				case 'binCompost.png':
					availableValidItems = ['pizza.png', 'burger.png']; 
					availableInvalidItems = ['paper.png', 'box.png', 'plasticbottle.png', 'can.png', 'glassbottle.png', 'chips.png', 'lightbulb.png'];
					break;
				case 'binLandfill.png':
					availableValidItems = ['chips.png', 'lightbulb.png'];
					availableInvalidItems = ['plasticbottle.png', 'can.png', 'glassbottle.png', 'paper.png', 'box.png', 'pizza.png', 'burger.png'];
					break;
			}

			// pick a random valid item to be the "correct answer"
			var randomValidItem = availableValidItems[Math.floor(Math.random() * availableValidItems.length)];
			availableInvalidItems = shuffle(availableInvalidItems); // randomize the list of invalid items
			// create a random hash for the "right answer"
			var answerHash = crypto.createHash('md5').update(Math.random().toString(36).substring(7)).digest('hex');
			var save = "INSERT INTO challenges (answer) VALUES ('" + answerHash + "')"; // enter the record of the right answer into db
			
			var trashHashes = [];
			trashHashes.push([answerHash,randomValidItem]); // add our correct answer to the list of icons to be drawn, indexed by its hash

			connection.query(save, function(err, info) {
				if (err) console.log(err);
				var id = info.insertId; // grab the primarykey of the correct answer

				for (var i = 0; i < 2; i++) // now add two invalid icons to the list, indexed by random hashes
					trashHashes.push([(crypto.createHash('md5').update(Math.random().toString(36).substring(7)).digest('hex')),availableInvalidItems.pop()]);
				console.log(trashHashes);	
				trashHashes = shuffle(trashHashes);

				var input = { id: id, data: trashHashes, bin: randomBin, type: 'dnd'};
				input = JSON.stringify(input);
				if (!reload)
					response += "window.input = ";

				response += input;


				if (!reload) {
					fs.readFile(path.join(__dirname, 'public', 'js', 'captcha.js'), function(err, data) {
						if (err) console.log(err);
						response += data;
						res.send(response);	
					});
				} else {
					res.setHeader('Content-Type', 'application/json');
					res.jsonp(response);
				}

				console.log(question);
			});
			break;
		default:
			question = 'An error occurred.';
			console.log(question);
			res.send(500, question);
		}
	});

app.get('/answer', function(req, res) {
	var id = req.query['id'],
	type = req.query['type'],
	answer = req.query['answer'];
	
	console.log(answer);
	// if someone is submitting an answer to a fact,
	// we want to hash their two-word answer into an md5
	// to compare with the database
	if (type == 'fact')
		answer = crypto.createHash('md5').update(answer).digest('hex');

	console.log(answer);
	var query = "SELECT * FROM challenges WHERE id=? AND answer=?";
	connection.query(query, [id, answer], function(err, rows) {
		var response;
		console.log("id=" + id + ",answer=" + answer);
		console.log(rows);
		if (rows.length === 1) // if we found exactly one record
			response = true;
		else
			response = false;

		var deleteChallenge = "DELETE FROM challenges WHERE id=?";
		connection.query(deleteChallenge, [id], function(delErr, delRows) {
			if (delErr) console.log(delErr);
		});
		res.setHeader('Content-Type', 'application/json');
		res.jsonp({ result: response});
	});
	// type = fact || dnd
	// answer = "word1 word2" || hash of binned item
});

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});






// utility functions

function shuffle(data) {
	var n = data.length;
	for(var i = n - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var tmp = data[i];
		data[i] = data[j];
		data[j] = tmp;
	}
	return data;
}



var draw = {};
draw.preDraw = function (sentence) {

	var canvas = new Canvas(300,80),
	app = 
	base_image = new Image(),
	ctx = canvas.getContext('2d');
  	base_image.src = 'images/base.png';
  	base_image.onload = function(){
   		context.drawImage(base_image, 100, 100);

  	}
}
draw.drawSentence = function (sentence) {
	

	
	tokens = sentence.split(' '),
	w1 = Math.floor(Math.random()*tokens.length),
	w2 = Math.floor(Math.random()*tokens.length),
	temp = 0;
	
	
	ctx.font = 'bold 12px Times';
	ctx.beginning = 20;
	ctx.fontSize = 12;
	ctx.width = canvas.width;


	while (w2 === w1) {
		w2 = Math.floor(Math.random()*tokens.length);
	}

	if (w2 < w1) {
		temp = w2;
		w2 = w1;
		w1 = temp;
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

	console.log(tokens[w1].trim() + " " + tokens[w2].trim());
	return [canvas.toDataURL(),tokens[w1].trim(),tokens[w2].trim()]; // returns base64 img png
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
	var path = [x + Math.floor(Math.random() * width),y + Math.floor(Math.random() * ctx.fontSize) - 10];
	// Add random lines
	for (var i = 0, lim =  Math.floor(Math.random() * 5 + 3); i < lim; i++) {
		ctx.strokeStyle = this.rndC();
		ctx.lineWidth = Math.floor(Math.random() * 2 + 1);
		ctx.beginPath();
		ctx.lineTo(path[0], path[1]);
		path = [x + Math.floor(Math.random() * width),y + Math.floor(Math.random() * ctx.fontSize) - 10];
		ctx.lineTo(path[0], path[1]);
		ctx.stroke();
	};

}

draw.rndC = function () {
	var colors = [0,0,0],
	ind = 0,
	str = '';
	colors[Math.floor(Math.random() * 3)] = 255;
	ind = Math.floor(Math.random() * 3);
	while (colors[ind] === 255) {
		ind = Math.floor(Math.random() * 3);
	}
	colors[ind] = Math.floor(Math.random() * 255);

	str = 'rgba(' + colors[0] + ',' + colors[1] + ',' + colors[2] + ',0.7)'
	return str;
}
draw.create = function(){

}

