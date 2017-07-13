'use strict';
var fs = require('fs'),
	readline = require('readline'),
	MongoClient = require('mongodb').MongoClient, 
	assert = require('assert');

function getDictSize(dict){
	var dictSize = 0;
	var rl = readline.createInterface({
		input: fs.createReadStream(dict),
		output: process.stdout,
		terminal: false
	});
	rl.on('line',function(line){
		dictSize += 1;
	});
	return dictSize;
}

function getCurrCode(mongoURI){
	var currCode;
	var codePromise = new Promise((resolve, reject) => {
		MongoClient.connect(mongoURI , function(err, db) {
			assert.equal(null, err);
			/*gets the only record in there, the code counter*/
			currCode = db.collection("codeCounter").findOne();
		});
	});
	codePromise.then(function(){
		return currCode;
	})
	.catch(function(){
		console.log("Can't get curr code");
	});
}

function makeNewCode(currCode, dictSize){

}

/*needs the mongoURI and the local dictionary JSON file path
chose to take in mongoURI rather than get from process because this is module*/
module.exports.genCode = function(dict, mongoURI){ 
	var dictSize = getDictSize(dict);
	var currCode = getCurrCode(mongoURI);
	var newCode = makeNewCode(currCode, dictSize);
	return currCode;
}
