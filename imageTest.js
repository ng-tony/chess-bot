// Require library 
var Jimp = require('jimp');
 
module.exports.createTestImage = function(){
	return new Promise(function (resolve, reject){
		console.log("Entering create Test Image");
		var image = new Jimp(256, 256, function (err, image){
			//idk if i need this call back;
			resolve(image.getBuffer());
		});
		/*console.log("TEST IMAGE: " + image.getExtension());
		image.write("./output.png", function (err, cb){
			if (err){
				console.log("Writing err " + err);
				reject("Writing err "+ err);
			}
			console.log("inside cb");
			console.log(cb);
			resolve();
		});*/
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