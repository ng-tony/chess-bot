// Require library 
var Jimp = require('jimp');
 
module.exports.createTestImage = function(){
	var image = new Jimp(256, 256, function (err, image){
		//idk if i need this call back;
	});
	image.write("./output.png", function(err){
		console.log(err);
	})
}

module.exports.doesImageExists = function(){
	Jimp.read("./output.png", function (err, image){
		if(err){
			console.log("Image not tehre");
		}
		
	})
}