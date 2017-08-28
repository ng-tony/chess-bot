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
		case "board":
			//sendTestImage(sender);
			getGame(sender).then((game) => {
				sendBoard(sender, game.board);
			}).catch((err) => {
				console.log("board", err);
			});
			break;
		case "move":
			var movePhrase = textSplit[1];
			if(movePhrase === undefined){
				sendTextMessage(sender, "Bad move phrase.");
				break;
			}
			getGame(sender).then((game) => { 
				if(isValidMove(game, movePhrase, sender)){
					updateGame(game, movePhrase, sender)
					.then(messagePlayers(game, movePhrase))
					.catch(error => {
						console.log(error.message);
						sendTextMessage(sender, "Failed to submit move");
					})
				} else {
					sendTextMessage(sender, "Invalid move");
				}
			})
			.catch(error => {
			  console.log(error.message);
			});
			/*
			getGameInfo(sender, textSplit[1])
			//issue here where i need textsplit[1] and sender
			.then(moveIfValid.bind(null, textSplit[1]))
			.then(updateGame)
			.then(tellBothSides)
			.catch(error => {
			  console.log(error.message);
			});*/
			break;
		case "resign":
			getGame(sender).then((game) => {
				var resigner = (sender === game.white) ? "White" : "Black";
				var resignee = (sender === game.white) ? "Black" : "White";
				sendTextMessage(game.white, resigner + " resigned, game over, "+resignee+" wins.");
			}).then(deleteGame(sender));
			break;
		case "draw":
			getGame(sender).then((game) => {
				game.drawOffered = true;
				return game;
			})
			break;
		case "drawaccept":
			break;
		case "help":
			sendHelp(sender);
			break;
		default:
			sendTextMessage(sender, "That's no command, type \"help\" for a list of commands");
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
					"isCheck": false,
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
function getGame(sender){
	return new Promise((resolve, reject) => {
		MongoClient.connect(mongoURI).then((db) => {
			var collection = db.collection('games');
			collection.findOne({$or: [{"white": sender}, {"black": sender}]})
			.then(resolve)
			.catch(function(){
				reject(new Error('getGame: Game not found'));
			});
		}).catch((err) => {
			console.log("Opening GameDB getGame: ", err);
			reject(new Error('getGame: games db not opening'));
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
function isValidMove(game, movePhrase, sender){
	var board = game.board;
	var color = (game.turnNum % 2 === 0) ? "w" : "b";
	var moveInfo = chess.getMoveInfo(movePhrase, board);
	
	if((color === "b" && game.black !== sender)
	|| (color === "w" && game.white !== sender)){
		sendTextMessage(sender, "It's not your turn");
		return false;
	}

	if(chess.isValidMove(movePhrase, color, board)){
		return true;
	} else {
		sendTextMessage(sender, "That's an invalid move!");
		return false;
	}
}
function updateGame(game, movePhrase, sender){
	return new Promise((resolve, reject) => {
		var move = chess.getMoveInfo(movePhrase, game.board);
		game.turnNum++;
		game.board[move.startY][move.startX] = 0;
		game.board[move.destY][move.destX] = move.pieceColor + move.piece;
		game.isCheck = chess.isCheck((game.turnNum % 2) ? "w" : "b", game.board);
		
		MongoClient.connect(mongoURI).then((db) => {
			var collection = db.collection('games');
			collection.updateOne({ $or: [{ "white": sender }, { "black": sender }] }, game)
				.then(resolve(game))
				.catch((err) => {
					console.log(err);
					reject(err);
				})
		}).catch((err) => {
			console.log("updating GameDB updateGame: ", err);
			reject(new Error('getGame: games db not opening'));
		})
	});
}

function deleteGame(sender){
	return new Promise((resolve, reject) => {
		MongoClient.connect(mongoURI).then((db) => {
			var collection = db.collection('games');
			collection.deleteOne({ $or: [{ "white": sender }, { "black": sender }]})
				.then(resolve)
				.catch((err) => {
					console.log(err);
					reject(err);
				})
		}).catch((err) => {
			console.log("Deleting game record deleteGame: ", err);
			reject(new Error('getGame: games db not opening'));
		})
	});
}

function messagePlayers(game, movePhrase){
	var mover = ((game.turnNum-1) % 2 === 0) ? "White" : "Black";
	var movee = ((game.turnNum) % 2 === 0) ? "White" : "Black";
	var isCheckPhrase = game.isCheck ? (movee + " is in Check.\n") : "";		
	sendTextMessage(game["white"], 
					mover + " move: " + movePhrase + " " + isCheckPhrase);
	sendBoard(game["white"], game.board);
	sendTextMessage(game["black"], 
					mover + " move: " + movePhrase + " " + isCheckPhrase);
	sendBoard(game["black"], game.board);
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
	imageGenerator.createImage(board).then((image) => {
		sendImage(sender, image, "board.png");
	});
}

function sendTestImage(sender) {
	imageGenerator.createImage("danny i need a board duh").then(function (image) {
		sendImage(sender, image, "test.png");
	});
}

function sendHelp(sender){
	sendTextMessage(sender, "create - gives you a game code to share with another");
	sendTextMessage(sender, "accept - accepts given game code to start game");
	sendTextMessage(sender, "board - gives you an image of the current board");
	sendTextMessage(sender, "move a2a3 - move a piece, if it is a valid move, format [start][destination] is used for each coordinate");
	sendTextMessage(sender, "resign - resigns your game");
	sendTextMessage(sender, "draw - offers to make the game a draw to opponent");
	
}