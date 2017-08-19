// Require library 
var Jimp = require('jimp');
var baseImage;
var pieces;
var coords = {
	"wK": {x: 0,   y: 0}, "bK":{x: 0,   y: 110},
	"wQ": {x: 110, y: 0}, "bQ":{x: 110, y: 110},
	"wB": {x: 220, y: 0}, "bB":{x: 220, y: 110},
	"wN": {x: 330, y: 0}, "bN":{x: 330, y: 110},
	"wR": {x: 440, y: 0}, "bR":{x: 440, y: 110},
	"wP": {x: 550, y: 0}, "bP":{x: 550, y: 110}
}
	var baseImageP = Jimp.read("./assets/base_board.png");
	var chessPieceP = Jimp.read("./assets/chess_pieces.png");
	Promise.all([baseImageP, chessPieceP]).then(function(values){
		baseImage = values[0];
		pieces = values[1];
	}).catch(function(err){
		console.log("ERROR LOADING PICTURES: " + err);
	});
module.exports.createTestImage = function(){
	return new Promise(function (resolve, reject){
		console.log("Entering create Test Image");
		var image = new Jimp(1024, 1024, function (err, image){
			//idk if i need this call back;
			image.getBuffer(Jimp.MIME_PNG, function(err, thing){
				console.log("err: "+err);
				console.log(thing);
				resolve(thing);
			})
		});
	})
}

module.exports.createImage = function(board){
	return new Promise(function (resolve, reject){
		console.log("Entering create Test Image");
		console.log(baseImage);
		var image = baseImage.clone();
		return image.getBuffer(Jimp.MIME_PNG, function(err, thing){
			if (err){
				console.log("err: " + err);
				reject(err);
			}
			//Do things to image to make it board
			console.log(thing);
			resolve(thing);
		});
	})
}