'use strict';

/**
takes in value from move command from message, 
converts it to value that can be used for accessing
the board array
**/
module.exports.coordToArrPos = function (val){
	const convert = { 
		"a": 0, "b": 1, "c": 2, "d": 3, "e": 4, "f": 5, "g": 6, "h": 7, 
		"8": 0, "7": 1, "6": 2, "5": 3, "4": 4, "3": 5, "2": 6, "1": 7};

	return convert[val];
}

/*return the first letter of the unit on that board coord
i.e. the color of the piece*/
function getColor(board, x, y){
	return board[y][x].charAt(0);
}

function pawn(color, startX, startY, destX, destY, board){
	if(color === "w"){
		//move forward 1
		if(destY - startY === 1){
			//moving diagonal 1, so killing a piece
			if((Math.abs(destX - startX) === 1)
			//or, just moving forward(not diagonal) and empty space there
			|| (destX === startX && board[destY][destX] === 0)){
				return true;
			}
		//first move for pawn, move two, also empty space
		}else if(Math.abs(destY - startY) === 2 && (startY === 6) && (board[destY][destX] === 0)){
			return true;
		}
	/*same thing as white, only Y is reversed and we kill white pieces now
		also, can move two if start at y === 1
	*/
	}else if(color === "b"){
		if(destY - startY === -1){
			if((Math.abs(destX - startX) === 1)
			|| (destX === startX && board[destY][destX] === 0)){
				return true;
			}
		}else if(Math.abs(destY - startY) === 2 && (startY === 1) && (board[destY][destX] === 0)){
			return true;
		}
	}
	return false;
}

function rook(color, startX, startY, destX, destY, board){
	var nothingInBetween = function(start, dest, board, isVertical){
		//check that nothing is inbetween
		var upperBound;
		var lowerBound;
		if(dest > start){
			upperBound = dest;
			lowerBound = start;
		}else{
			upperBound = start;
			lowerBound = dest;
		}
		
		/* since rook can't jump over piece, return false if trying that
		   lowerBound + 1 since its not looking at either end points
		*/
		for(var i = 1; i < upperBound - lowerBound - 1; i++){
			if((isVertical && (board[lowerBound + i][startX] === 0))
			|| (!isVertical && (board[startY][lowerBound + i] === 0))){
				return false;
			}
			
		}
		return true;
	};
	//move vertically
	if(((destX === startX) && nothingInBetween(startY, destY, board, true))
	//move horizontally, destY is now destX, startY is now startX
	||((destY === startY) && nothingInBetween(startX, destX, board, false))){
		return true;
	}
	return false;
}

function bishop(color, startX, startY, destX, destY, board){
	//just uses the params from parent function
	function nothingInBetween(){
		var upperBoundX;
		var upperBoundY;
		var lowerBoundX;
		var lowerBoundY;

		if(destX > startX){
			upperBoundX = destX;
			lowerBoundX = startX;
		}else{
			upperBoundX = startX;
			lowerBoundX = destX;
		}
		
		if(destY > startY){
			upperBoundY = destY;
			lowerBoundY = startY;
		}else{
			upperBoundY = startY;
			lowerBoundY = destY;
		}
	
		//chose upperBoundX and lowerBoundX because only displacement amount matters
		//completely arbitrary, could use the other too
		for(var i = 1; i < upperBoundX - lowerBoundX - 1; i++){
			if(board[lowerBoundY + i][lowerBoundX + i]){
				return false;
			}
		}
	}
	
	if((Math.abs(destX-startX) === Math.abs(destY-startY)) && nothingInBetween()){
		return true;
	}
	return false;
}

// castling is done elsewhere
function king(color, startX, startY, destX, destY, board){
	//since eating its own piece is already checked for, nothing to really check
	if((Math.abs(startX - destX) === 1) && (Math.abs(startY - destY) === 1)){
		return true;
	}
}

/**
returns 2d array that represents chess board
N is knight
b is black
w is white
**/
/*accessing this board
will be board[Y coord][X coord] because it is row then term*/
module.exports.initBoard = function (){
	var board = [["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
			 ["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],
			 [0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0],
			 ["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"],
			 ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"]];
	return board;
}

/* *** need to check if move is out of range of board
	check if it puts king into check
	check if invalid move command(letter and numbers are out of order or something)
	check if move is not putting piece in the same place its already in
	check if move tries to kill piece of own colour
*/
module.exports.isValidMove = function (color, piece, startX, startY, destX, destY, board){
	var isValid = false;
	switch(piece){
		case "P":
			isValid = pawn(color, startX, startY, destX, destY, board);
			break;
		case "R":
			isValid = rook(color, startX, startY, destX, destY, board);
			break;
		case "N":
			break;
		case "B":
			break;
		case "Q":
			break;
		case "K":
			isValid = king(color, startX, startY, destX, destY, board);
			break;
	}
	
	return isValid;
}


