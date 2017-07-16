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
	return new Promise(function (resolve, rejedct){
		MongoClient.connect(mongoURI , function(err, db){
			if(err){
				console.log("GET CURRCODE: OPENING", err);
				reject(err);
			} else {
					var collection = db.collection('codeCounter');
					collection.find().toArray(function(err, res) {
					if(err){
						console.log("GET CURRCODE: READING", err);
					} else{
						console.log(res[0]);
						resolve(res[0].codeCounter);
					}
					})
				}
			});
	}
}

function makeNewCode(currCode, dictSize){

}

/*needs the mongoURI and the local dictionary JSON file path
chose to take in mongoURI rather than get from process because this is module*/
module.exports.genCode = function(dict, mongoURI){ 
	var dictSize = getDictSize(dict);
	var currCode = getCurrCode(mongoURI);
	var newCode = makeNewCode(currCode, dictSize);
	console.log(currCode);
	return currCode;
}
