'use strict';
var fs = require('fs'),
	readline = require('readline'),
	MongoClient = require('mongodb').MongoClient, 
	assert = require('assert');


var dict = (function(){
	fs.readFile('dict.json', 'utf8', function (err, data) {
		if(err) throw err;
		return JSON.parse(data);
	})
	})()
/*function getDictSize(dict){
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", filename, false);
	rawFile.onreadystatechange = function () {
		if (rawFile.readyState === 4) {
			if (rawFile.status === 200 || rawFile.status == 0){
				dict = JSON.parse
			}
		}
	}
	return new Promise(function(resolve, reject){
		var dictSize = 0
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
}*/

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
		var k = 0;
		var i;
		for(i = (codeCounter.length - 1); i > 0; i--){
			if((codeCounter[i] + 1) > (dictSize - 1) && (i - 1 >= 0)){
				codeCounter[i] = 0;
				codeCounter[i - 1] += 1;
			}
		}
		return codeCounter;
}

/*needs the mongoURI and the local dictionary JSON file path
chose to take in mongoURI rather than get from process because this is module*/
module.exports.genCode = function(dict, mongoURI){
	return new Promise(function(resolve, reject){
		makeCode = makeNewCode.bind(null, dict.length);
		resolve(getCurrCode(mongoURI).then(makeCode));
	});
}
