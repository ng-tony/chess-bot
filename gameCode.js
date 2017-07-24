'use strict';

const mongoURI = process.env.MONGODB_URI;

var fs = require('fs'),
	readline = require('readline'),
	MongoClient = require('mongodb').MongoClient, 
	assert = require('assert'),
	codeCounter = "codeCounter",
	dict = "dict"; 
function showTest(){
	console.log("showTest");
	console.log("Dict: " + dict);
	console.log("codeCounter: " + codeCounter)
}
function init(){
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
					codeCounter = JSON.parse(JSON.stringify(res[0].codeCounter));
					showTest();
					//
				}
			})
		}
	});

	fs.readFile('dict.json', 'utf8', function (err, data) {
		if(err) throw err;
		console.log(JSON.parse(data));
		dict = JSON.parse(data);
		showTest();
	});
}
init();

//IDK Why the latter dont work but im sure this part does
/*module.exports.codeCounter = {};
module.exports.dict = {};
module.exports.initf = false;*/
/*var codeCounter = [];
var dict = []; 
var initf = false;

var init = function() {
	//get codeCounter
	console.log("initing");//
	console.log(init);
	if(this.initf) {
		return; //
	}
	initf = true;
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
					codeCounter = (res[0].codeCounter);
					//
				}
			})
		}
	});

	//getDict
	fs.readFile('dict.json', 'utf8', function (err, data) {
		if(err) throw err;
		console.log(JSON.parse(data));
		dict = JSON.parse(data);
	})
}
*/

/*
function getCurrCode(){
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
}*/

/*limitation, if codeCounter exceeds [n,n,n,n], where n
is dictSize, counter does not change*/
var makeNewCode = function(){
		//I wonder if there is going to be any async issues, if u run two of these at the same time hmm
		var isFinished = false;
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
				reject(err);
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

function genCode(){
	console.log("genCode");
	console.log("fs: " + fs);
	console.log("codeCounter: " + codeCounter);
	
	return new Promise(function(resolve, reject){
		//var makeCode = makeNewCode.bind(codeCounter, dict.length);
		makeNewCode().then(function (code){
				resolve(code);
		});
	});
}

/*needs the mongoURI and the local dictionary JSON file path
chose to take in mongoURI rather than get from process because this is module*/
/*exports.genCode = genCode;*/
/*var Game = function (){

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
					codeCounter = (res[0].codeCounter);
					//
				}
			})
		}
	});

	//getDict
	fs.readFile('dict.json', 'utf8', function (err, data) {
		if(err) throw err;
		console.log(JSON.parse(data));
		dict = JSON.parse(data);
	})

	this.dict = dict;
	this.codeCounter = codeCounter;
};

Game.prototype.makeNewCode = makeNewCode;
Game.prototype.genCode = genCode;*/
module.exports.genCode = genCode;