// Require library 
var gd = require('node-gd');
 
module.exports.createTestImage = function(){
// Create blank new image in memory 
var img = gd.createSync(200, 80);
 
// Set background color 
img.colorAllocate(0, 255, 0);
 
// Set text color 
var txtColor = img.colorAllocate(255, 0, 255);
 
// Set full path to font file 
var fontPath = '/full/path/to/font.ttf';
 
// Render string in image 
img.stringFT(txtColor, fontPath, 24, 0, 10, 60, 'Hello world!');
 
// Write image buffer to disk 
img.savePng('output.png', 1, function(err) {
  if(err) {
    throw err;
  }
});
 
// Destroy image to clean memory 
img.destroy();
}