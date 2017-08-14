// Require library 
var Jimp = require('jimp');
 
module.exports.createTestImage = function(){
	console.log("Entering create Test Image");
	var image = new Jimp(256, 256, function (err, image){
		//idk if i need this call back;
	});
	console.log("Entering create Test Image");
	console.log(image.getExtension());
	image.write("./output.png").then(function () {
		console.log("Made image");
	}).catch(function () {
		console.log("Error creating image");
		console.log(err);
	});
	console.log("Exiting create Test Image");
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