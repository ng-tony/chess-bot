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

function getCurrCode(){

}

function makeNewCode(currCode, dictSize){
	
}

module.exports.genCode = function(dict){
	var dictSize = getDictSize(dict);
	var currcode = getCurrCode();
	var newCode = makeNewCode(currCode, dictSize);
}
