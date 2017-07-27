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


/**
returns 2d array that represents chess board
N is knight
b is black
w is white
**/
function pawn(color, startX, startY, destX, destY, board){
	if(color === "w"){
		//move forward 1
		if(destY - startY === 1){
			//moving diagonal 1, so killing a piece
			//piece must be black since we are white
			if((Math.abs(destX - startX) === 1 && getColor(board[destY][destX]) === "b")
			//or, just moving forward(not diagonal) and empty space there
			|| (destX === startX && board[destY][destX] === 0)){
				return true;
			}
		}
	//same thing as white, only Y is reversed and we kill white pieces now
	}else if(color === "b"){
		if(destY - startY === -1){
			if((Math.abs(destX - startX) === 1 && getColor(board[destY][destX]) === "w")
			|| (destX === startX && board[destY][destX] === 0)){
				return true;
			}
		}
	}
	return false;
}

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

module.exports.isValidMove = function (color, piece, startX, startY, destX, destY, board){
	var isValid = false;
	switch(piece){
		case "P":
			isValid = pawn(color, startX, startY, destX, destY, board);
			break;
		case "R":
			break;
		case "N":
			break;
		case "B":
			break;
		case "Q":
			break;
		case "K":
			break;
	}
	return isValid;
}


