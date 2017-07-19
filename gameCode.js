'use strict';
var fs = require('fs'),
	readline = require('readline'),
	MongoClient = require('mongodb').MongoClient, 
	assert = require('assert');
	
var codeCounter = (function (){
	getCurrCode(mongoURI).then(function (val) {
			return val;
	});
})();

var dict = (function(){
	fs.readFile('dict.json', 'utf8', function (err, data) {
		if(err) throw err;
		return JSON.parse(data);
	})
	})()

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
		makeCode = makeNewCode.bind(codeCounter, dict.length);
		makeNewCode(codeCounter, dict.length).then(function (code){
				resolve(code);
		});
	});
}
