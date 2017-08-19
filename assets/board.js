console.log("magick -size 1024x1024 canvas:white \\");
console.log("-stroke \"#000000\" \\");
console.log("-fill \"#D18B47\" \\");
console.log("-draw \"rectangle 72,72 952,952\" \\");
console.log("-fill \"#FFCE9E\" \\");
for(var i =  0; i < 8; i++){
    for (var t = 0; t < 8; t += 2){
        if(i % 2 == 0){
            console.log('-draw "rectangle ' + (72+(i*110)) + "," + (72 + (t*110)) + " " + (72 + ((i+1)*110)) + "," + (72 + ((t+1)*110))+'" \\' )
        } else {
            console.log('-draw "rectangle ' + (72+(i*110)) + "," + (72 + ((t+1)*110)) + " " + (72 + ((i+1)*110)) + "," + (72 + ((t+2)*110))+'" \\' )
        }
    }
}
console.log('-font Arial -pointsize 56 -fill black \\');
for(var i = 0; i < 8; i++){
    console.log('-draw "text ' + 18 + ',' + (151 + ((i)*110))  + ' \'' + (8-i) + '\'" \\')
    console.log('-draw "text ' + (105 + ((i)*110)) + ',' + (72-18) + ' \'' + String.fromCharCode(65+i) + '\'" \\')
}
console.log("board_image.png")