var Canvas = require('canvas');
var draw = {};

draw.drawSentence = function (sentence) {
	
	var canvas = new Canvas(300,200),
	tokens = sentence.split(' '),
	w1 = Math.floor(Math.random()*tokens.length),
	w2 = Math.floor(Math.random()*tokens.length),
	ctx = canvas.getContext('2d');
	
	ctx.font = '12px Impact';
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

	return canvas.toDataURL(); // returns base64 img png
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
	for (var i = 0, lim =  Math.floor(Math.random() * 15 + 1); i < lim; i++) {
		ctx.strokeStyle = 'rgba(' + this.rndC() + ',' + this.rndC() + ',' + this.rndC() + ',0.7)';
		ctx.lineWidth = Math.floor(Math.random() * 2 + 1);
		ctx.beginPath();
		ctx.lineTo(x + Math.floor(Math.random() * width), y + Math.floor(Math.random() * ctx.fontSize) - 5);
		ctx.lineTo(x + Math.floor(Math.random() * width), y + Math.floor(Math.random() * ctx.fontSize) - 5);
		ctx.stroke();
	}

}

draw.rndC = function () {
	return Math.floor(Math.random() * 100);
}

var sentence = "Landfill disposal was increased over the course of last year";
var img = draw.drawSentence(sentence);
console.log('<img src="' + img+ '" />');
