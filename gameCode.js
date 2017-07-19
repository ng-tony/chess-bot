'use strict';
var fs = require('fs'),
	readline = require('readline'),
	MongoClient = require('mongodb').MongoClient, 
	assert = require('assert');

function getDictSize(dict){
	return new Promise(function(resolve, reject){
		var dictSize = 0;
		var rl = readline.createInterface({
			input: fs.createReadStream(dict),
			output: process.stdout,
			terminal: false
		});
		rl.on('line', function(line){
			dictSize += 1;
		});
		rl.on('close', function(){
			resolve(dictSize);
		})
	});
}

function getCurrCode(mongoURI){
	return new Promise(function (resolve, reject){
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
						//
					}
					})
				}
			});
	});
}

/*limitation, if codeCounter exceeds [n,n,n,n], where n
is dictSize, counter does not change*/
function makeNewCode(codeCounter, dictSize){
	/*
	codeCounter is an array counting current permutation of game code
	returned by the currcode promise
	
	
	*/
	
	/*!!! still need to return code Counter after change, idk how to do that
	for promises*/
	return new Promise(function (resolve, reject){
		var i;
		for(i = (codeCounter.length - 1); i > 0; i--){
			if((codeCounter[i] + 1) > (dictSize - 1) && (i - 1 >= 0)){
				codeCounter[i] = 0;
				codeCounter[i - 1] += 1;
			}
		}
	});
}

/*needs the mongoURI and the local dictionary JSON file path
chose to take in mongoURI rather than get from process because this is module*/
module.exports.genCode = function(dict, mongoURI){
	return new Promise(function(resolve, reject){
		var makeCode;
		var getCode;
		getDictSize(dict).then(function(dictSize){
			makeCode = makeNewCode.bind(null, dictSize);
			getCode = getCurrCode.bind(mongoURI);
		})
		.then(getCurrCode)
		.then(makeCode);
	});
}
