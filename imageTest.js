// Require library 
var Jimp = require('jimp');
var baseImage = (function(){
	return new Promise(function (resolve, reject){
		Jimp.read("base_board.png").then(function(image){
			console.log(image);
			resolve(image);
		}).catch(function(err){
			console.log("ERROR LOADING BASE IMAGE: " + err);
			reject(err);
		})
	})
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
	//do some shit with board
	return new Promise(function (resolve, reject){
		console.log("Entering create Test Image");
		var image = image.clone();
		return image.getBuffer(Jimp.MIME_PNG, function(err, thing){
			console.log("err: " + err);
			console.log(thing);
			resolve(thing);
		});
	})
}

module.exports.doesImageExists = function(){
	console.log("Entering does image exists");
	Jimp.read("./output.png").then(function (image){
		console.log(image.getExtension());
		console.log("Image is here?!?!?!?");
		
	}).catch(function (err) {
		console.log("Image not tehre");
			return;
	})
	console.log("Exiting does image exists");	
}