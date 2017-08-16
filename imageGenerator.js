// Require library 
var Jimp = require('jimp');
var baseImage;

(function init(){
	new Promise(function (resolve, reject){
		Jimp.read("base_board.png").then(function(image){
			console.log(image);
			resolve(image);
		}).catch(function(err){
			console.log("ERROR LOADING BASE IMAGE: " + err);
			reject(err);
		})
	}).then(function(image){
		baseImage = image;
	}).catch(function(err){
		console.log("ERROR LOADING BASE IMAGE: " + err);
	});
})();

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