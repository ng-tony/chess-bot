// Require library 
var Jimp = require('jimp');
 
module.exports.createTestImage = function(){
	var image = new Jimp(256, 256, function (err, image){
		//idk if i need this call back;
	});
	image.write("./output.png,", function(){
		console.log("sucess wriitng");
	})
}