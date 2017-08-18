'use strict'

var MongoClient = require('mongodb').MongoClient,
	assert = require('assert'),
	gameCode = require('./gameCode'),
	chess = require('./chess'),
	fs = require('fs'),
	imageGenerator = require('./imageGenerator.js');
const express = require('express'),
	bodyParser = require('body-parser'),
	request = require('request'),
	Curl =  require('node-libcurl').Curl,
	app = express(),
	token = process.env.PAGE_ACCESS_TOKEN,
	mongoURI = process.env.MONGODB_URI;

MongoClient.connect(mongoURI , function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to Mongo server");

  db.close();
});

app.set('port', (process.env.PORT || 5000))

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended: false
}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function(req, res) {
	res.send('App Online!')
})

// for Facebook verification
app.get('/webhook/', function(req, res) {
	if (req.query['hub.mode'] && req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
		res.status(200).send(req.query['hub.challenge'])
	} else {
		res.send('Error, wrong token')
	}
})

app.post('/webhook/', function(req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i];
		let sender = event.sender.id;
		let timestamp = event.timestamp;
 		if (event.message && event.message.text) {
			let text = event.message.text;
			messageHandler(sender, text);
			// logMessage(sender, text, timestamp);
			// repeatLastMessages(sender);
		}
	}
	res.sendStatus(200)
})

function logMessage(sender, text, timestamp){
	MongoClient.connect(mongoURI , function(err, db) {
		assert.equal(null, err);
		var message = { "sender": sender, "text":text, "timestamp":timestamp};
		db.collection("datamine").insertOne(message, function(err, res) {
			if (err) throw err;
			console.log("MESSAGE WAS LOGGED");
			db.close();
		})
	});
}

function repeatLastMessages(sender){
	MongoClient.connect(mongoURI , function(err, db) {
		assert.equal(null, err);
		//Find latest 3 message from this user
		var cursor = db.collection("datamine").find({"sender":sender}).sort({"timestamp":-1}).limit(3);
		
		cursor.toArray(function(err, results) {
			if (err) throw err;
			var message = "";
			//Compress messages to one message and send it
			for(var i = 0; i < results.length; i++){
				message += results[i].text + "\n";
			}
			sendTextMessage(sender, message);
			db.close();
		})
	});
}

function messageHandler(sender, text){
	//array of split terms from the command
	
	let textSplit = text.toLowerCase().split(" ");
	
	switch(textSplit[0]){
		case "hey":
			sendTextMessage(sender, "Hey!" + sender.toString());
			break;
		case "create":
			var newGameCode = gameCode.genCode();
			console.log(newGameCode);
			sendTextMessage(sender, newGameCode.toString());
			initGame(sender, newGameCode);
			break;
		case "accept": //accept should have bulletproofing that game with same p1 and p2 already exists
			gameCode.acceptGame(text.split(" ")[1], sender.toString()).then(() => {
				sendTextMessage(sender, "Game Started!");
				//Display shit eh?
			}).catch((e) => {
				console.log("Unabled ot start game " + e.toString());
				sendTextMessage(sender, "Unable to start game: " + e.toString());
			})
			try {
				gameCode.acceptGame(textSplit[1]);
				//LIKE DISPLAY GAME OR SOME SHIT?
			}
			catch (e) {
				sendTextMessage(sender, "Unable to start game" + e);
			}
			break;
		case "test":
			sendTestImage(sender);
			break;
		case "move":
			if(textSplit[1] === undefined){
				sendTextMessage(sender, "Bad move phrase.");
				break;
			}
			
			getGameInfo(sender, textSplit[1])
			//issue here where i need textsplit[1] and sender
			.then(moveIfValid)
			.then(updateGame)
			.then(tellBothSides)
			.catch(error => {
			  console.log(error.message);
			});
			break;
		case "resign":
			break;
		case "draw":
			break;
		case "help":
			sendHelp(sender);
			break;
		default:
			sendTextMessage(sender, "That's no command");
			sendHelp(sender);
			break;
	}
}

function initGame(sender, gameCode){
	MongoClient.connect(mongoURI , function(err, db) {
		assert.equal(null, err);
		var senderID = sender.toString();
		var game = {"white": senderID, 
					"board": chess.initBoard(),
					"gameCode": gameCode,
					"turnNum": 0,
					"isCheckBlack": false,
					"isCheckWhite": false,
					"drawOffered": false,
					"movePiece": 0,
					"moveLocationX": 0,
					"moveLocationY": 0}
		db.collection("games").insertOne(game, function(err, res) {
			if (err) throw err;
			console.log("NEW GAME ADDED! CHALLENGER:" + sender.toString);
			db.close();
		})
	});
}

function getGameInfo(sender, movePhrase){
	return new Promise((resolve, reject) => {
		MongoClient.connect(mongoURI, function (err, db) {
			if(err){
				console.log("Opening GameDB getMoverInfo: ", err);
				reject(new Error('getGameInfo: games db not opening'));
			}
			else {
				var collection = db.collection('games');
				collection.findOne({$or: [{"white": sender}, {"black": sender}]})
				.then(function(gameInfo){
					console.log(gameInfo);
					resolve({"sender": sender, "movePhrase": movePhrase, "gameInfo": gameInfo});
				}).catch(function(){
					reject(new Error('getGameinfo: Game not found'));
				});
			}
		});
	});
}

function moveIfValid(resolveObj){
	return new Promise((resolve, reject) => {

		var sender = resolveObj["sender"];
		var movePhrase = resolveObj["movePhrase"];
		var gameInfo = resolveObj["gameInfo"];
		
		var board = gameInfo["board"].map(function(arr) {
		    return arr.slice();
		});
		
	    var color = (gameInfo.turnNum % 2 === 0) ? "w" : "b";
	    //(start)letter number,(destination) letter Number, 
	    var moveInfo = chess.getMoveInfo(movePhrase, board);
	    
	    var isCheckWhite = gameInfo.isCheckWhite;
	    var isCheckBlack = gameInfo.isCheckBlack;
	    var checkStatus = (color === "w") ? isCheckWhite : isCheckBlack;
	    
	    //check if turn number and person moving is same person
	    if(color === "w" && (gameInfo.white !== sender)
	    || color === "b" && (gameInfo.black !== sender)){
	    	sendTextMessage(sender, "It's not your turn.");
	    	reject(new Error("not your turn"));
	    }
	    if(chess.isValidMove(movePhrase, color, checkStatus, board)){
	    	board[moveInfo["destY"]][moveInfo["destX"]] = moveInfo.pieceColor + moveInfo.piece;
			board[moveInfo["startY"]][moveInfo["startX"]] = 0;
			if(chess.isCheck("w", board)){
				isCheckWhite = true;
			}
			if(chess.isCheck("b", board)){
				isCheckBlack = true;
			}
			console.log("where does this stop");
			resolve({"sender": sender, "gameInfo": gameInfo, "isCheckWhite": isCheckWhite, "isCheckBlack": isCheckBlack, "board": board});
	    }else{
	    	sendTextMessage(sender, "That's an invalid move!");
	    	reject(new Error("invalid move"));
	    }
	});
}

function updateGame(resolveObj){
	return new Promise((resolve, reject) => {
		var sender = resolveObj["sender"];
		var isCheckWhite = resolveObj["isCheckWhite"];
		var isCheckBlack = resolveObj["isCheckBlack"];
		var board = resolveObj["board"];
		var gameInfo = resolveObj["gameInfo"];
		MongoClient.connect(mongoURI, function (err, db) {
			if (err) {
				reject(new Error("Opening GameDB updateGame: " + err));
			}
			else {
				var collection = db.collection('games');

				gameInfo.isCheckWhite = isCheckWhite;
				gameInfo.isCheckBlack = isCheckBlack;
				gameInfo.board = board;
				
				collection.updateOne({$or: [{white: sender}, {black: sender}]}, gameInfo, function(err, res){
					if(err){
						reject(new Error("updateGame: can't write to db"));
						return;
					}else{
						resolve(resolveObj);
					}
				});
			}
		});
	});
}

function tellBothSides(resolveObj){
	return new Promise((resolve, reject) =>{
		var mover = (resolveObj["gameInfo"].turnNum % 2 === 0) ? "White" : "Black";
		var movePhrase = resolveObj["movePhrase"];
		var isCheckPhrase = "";
		isCheckPhrase += (resolveObj["isCheckWhite"]) ? "White is in Check.\n" : "";
		isCheckPhrase += (resolveObj["isCheckBlack"]) ? "Black is in Check.\n" : "";
		
		sendTextMessage(resolveObj["sender"], 
						mover + " move: " + movePhrase + " " + isCheckPhrase);
	});
}

function sendTextMessage(sender, text) {
	let messageData = {
		text: text
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: token
		},
		method: 'POST',
		json: {
			recipient: {
				id: sender
			},
			message: messageData
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}
//TODO better error handling? 
function sendImage(sender, image, filename){
	var r = request.post({
		url:'https://graph.facebook.com/v2.6/me/messages?',
		qs:{access_token: token}
	},
	function (error, response, body) {
		if (error) {
			console.log('Error sending Image: ', error);
		} else if (response.body.error) {
			console.log('Error sending Image: ', response.body.error);
		}
	});
	var form = r.form();
	form.append('recipient', '{"id":"' + sender + '"}');
	form.append('message', '{"attachment":{"type":"image", "payload":{}}}');
	form.append('filedata', image, { "filename": filename });
}

function sendBoard(sender, board){
	imageGenerator.createImage(board);
	sendImage(sender, image, filename);
}

function sendTestImage(sender) {
	imageGenerator.createImage("danny i need a board duh").then(function (image) {
		sendImage(sender, image, "test.png");
	});
}

function sendHelp(sender){
	sendTextMessage(sender, "HELP: I'M TRYING DAMNIT!")
}