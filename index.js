'use strict'

var MongoClient = require('mongodb').MongoClient,
	assert = require('assert'),
	gameCode = require('gameCode'),
	chess = require('./chess');
const express = require('express'),
	bodyParser = require('body-parser'),
	request = require('request'),
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
		var message = { "sender": sender, "text":text, "timestamp":time};
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
	//if the message does not call out the chat bot, it is not a command
	if(textSplit[0] !== "@chess-bot" && textSplit[0] !== "@chess"){
		return null;
	}
	
	switch(textSplit[1]){
		case "hey":
			sendTextMessage(sender, "Hey!" + sender.toString());
			break;
		case "create":
			initGame(sender);
			sendTextMessage(sender, chess.initBoard().toString());
			sendTextMessage(sender, gameCode.genCode("./dict.json", mongoURI));
			break;
		case "accept": //accept should have bulletproofing that game with same p1 and p2 already exists
			break;
		case "move":
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

function initGame(sender){
	MongoClient.connect(mongoURI , function(err, db) {
		assert.equal(null, err);
		var senderID = sender.toString();
		var game = {"white": senderID, 
					"board": chess.initBoard(),
					//"groupChatID": getChatID(); //WIP
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

function sendHelp(sender){
	sendTextMessage(sender, "HELP: I'M TRYING DAMNIT!")
}