'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
var MongoClient = require('mongodb').MongoClient, assert = require('assert')
const app = express()
const token = process.env.PAGE_ACCESS_TOKEN
const mongoURI = process.env.MONGODB_URI;

MongoClient.connect(process.env.MONGODB_URI , function(err, db) {
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
	console.log("REQUEST");
	console.log(req.body.entry);
	console.log(req.body.entry[0].messaging);
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		let timestamp = event.timestamp;
 		if (event.message && event.message.text) {
			let text = event.message.text
			messageHandler(sender, text)
			logMessage(sender, text, timestamp);
			repeatLastMessages(sender);
		}
	}
	res.sendStatus(200)
})

function logMessage(sender, text, time){
	MongoClient.connect(process.env.MONGODB_URI , function(err, db) {
		assert.equal(null, err);
		var message = { id: sender, "text":text, "time":time};
		db.collection("datamine").insertOne(message, function(err, res) {
			if (err) throw err;
			console.log("MESSAGE WAS LOGGED");
			db.close();
		})
	});
}

function repeatLastMessages(sender){
	MongoClient.connect(process.env.MONGODB_URI , function(err, db) {
		assert.equal(null, err);
		var cursor = db.collection("datamine").find().sort({timestamp:-1}).limit(3);
		
		cursor.toArray(function(err, results) {
			if (err) throw err;
			for(var i = 0; i < results.length; i++){
				sendTextMessage(sender, results[i].text);
			}
			db.close();
		})
	});
}

function messageHandler(sender, text){
	//array of split terms from the command
	
	let textSplit = text.toLowerCase().split(" ")
	//if the message does not call out the chat bot, it is not a command
	if(textSplit[0] !== "@chess-bot" && textSplit[0] !== "@chess"){
		return null
	}
	
	switch(textSplit[1]){
		case "hey":
			sendTextMessage(sender, "Hey!" + sender.toString())
			break
		case "challenge":
			break
		case "move":
			break
		case "resign":
			break
		case "draw":
			break
		case "accept":
			break
		case "help":
			sendHelp(sender)
			break
		default:
			sendTextMessage(sender, "That's no command")
			sendHelp(sender)
			break
	}
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
