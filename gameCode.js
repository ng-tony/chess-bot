'use strict';

const mongoURI = process.env.MONGODB_URI;

var fs = require('fs'),
	readline = require('readline'),
	MongoClient = require('mongodb').MongoClient, 
	assert = require('assert'),
	dict = "dict";

var codeCounter = (function(){
	MongoClient.connect(mongoURI , function(err, db){
		if(err){
			console.log("GET CURRCODE: OPENING", err);
		} else {
			var collection = db.collection('codeCounter');
			collection.find().toArray(function(err, res) {
				if(err){
					console.log("GET CURRCODE: READING", err);
				} else{
					console.log(res[0]);
					return JSON.parse(JSON.stringify(res[0].codeCounter));
				}
			})
		}
	});
})();

var dict = (function(){
	fs.readFile('dict.json', 'utf8', function (err, data) {
		if(err) throw err;
		console.log(JSON.parse(data));
		return JSON.parse(data);
	});
})();

/*limitation, if codeCounter exceeds [n,n,n,n], where n
is dictSize, counter does not change*/
var makeNewCode = function(){
		//I wonder if there is going to be any async issues, if u run two of these at the same time hmm
		var isFinished = false;
		var curr = codeCounter.length - 1;
		console.log("makeNewCode");
		console.log(this);
		codeCounter[curr]++;
		while (!isFinished && curr > 0) {
			if (codeCounter[curr] > (dict.length - 1)){
				codeCounter[curr] = 0;
				curr--;
				if (curr < 0 ){
					throw "Code Counter Overflowed, I.E Game Limit Reached";
				}
				else {
					codeCounter[curr - 1]++;
				}
			}
			else {
				isFinished = true;
			}
		}
		
		MongoClient.connect(mongoURI , function(err, db){
			if(err){
				console.log("WRITING CURRCODE TO DB: ", err);
			} else {
					var collection = db.collection('codeCounter');
					collection.updateOne({}, {"codeCounter" : codeCounter}, function(err, res) {
					if(err){
						console.log("WRITING CURRCODE TO DB: ", err);
					} else{
						console.log("WRITING CURRCODE TO DB: Success");
					}
					})
				}
		});
		return codeCounter;
}

module.exports.genCode = function (){
	console.log("genCode");
	console.log("fs: " + fs);
	console.log("codeCounter: " + codeCounter);
	
	return new Promise(function(resolve, reject){
		//var makeCode = makeNewCode.bind(codeCounter, dict.length);
		resolve(makeNewCode());
	});
};