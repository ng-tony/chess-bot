'use strict';

/**
takes in string value from move command from message, 
converts it to value that can be used for accessing
the board array
**/
function stringToNumber(val){
	const convert = { 
		"a": 0, "b": 1, "c": 2, "d": 3, "e": 4, "f": 5, "g": 6, "h": 7,
		"8": 0, "7": 1, "6": 2, "5": 3, "4": 4, "3": 5, "2": 6, "1": 7
	};
	
	//check for bad coords
	if(convert[val] !== undefined){
		return convert[val];
	}else{
		throw new Error('invalid string to convert to coordinate');
	}
}

/*return the first letter of the unit on that board coord
i.e. the color of the piece*/
function getColor(board, x, y){
	return board[y][x].charAt(0);
}

function getPiece(startX, startY, board){
	var piece = board[startY][startX].toUpperCase();
	if(piece in ["P","R","N","B","Q","K"]){
		return board[startY][startX].char(1);
	}else{
		throw new Error('no valid piece found');
	}
}

function getMoveInfo(movePhrase, board){
	var startX = stringToNumber(movePhrase.charAt(0));
	var startY = stringToNumber(movePhrase.charAt(1));
	var destX = stringToNumber(movePhrase.charAt(2));
	var destY = stringToNumber(movePhrase.charAt(3));
	var piece = getPiece(startX, startY);
	var pieceColor = getColor(board, startX, startY);

	return {"startX": startX,
			"startY": startY, 
			"destX": destX, 
			"destY":destY,
			"piece": piece,
			"pieceColor": pieceColor
	};
}

function nothingBetweenDiag(startX, startY, destX, destY, board){
	var upperBoundX;
	var lowerBoundX;
	var lowerBoundY;
	/*don't need to do upperBoundY because we
	use upperBoundX to get the number of spaces that the bishop
	moves vertically*/
	if(destX > startX){
		upperBoundX = destX;
		lowerBoundX = startX;
	}else{
		upperBoundX = startX;
		lowerBoundX = destX;
	}
	
	if(destY > startY){
		lowerBoundY = startY;
	}else{
		lowerBoundY = destY;
	}

	//chose upperBoundX and lowerBoundX because only displacement amount matters
	//completely arbitrary, could use the other too
	for(var i = 1; i < upperBoundX - lowerBoundX - 1; i++){
		if(board[lowerBoundY + i][lowerBoundX + i]){
			return false;
		}
	}
	return true;
}

function nothingBetweenLateral(start, startX, startY, dest, board, isVertical){
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
		||(!isVertical && (board[startY][lowerBound + i] === 0))){
			return false;
		}
		
	}
	return true;
}

function isCheck(color, piece, startX, startY, destX, destY, board){
	var isVertCheck = function (color, startX, startY, board){
		var ownKing = color+"K";
		var oppositeColor = color === "w" ? "b" : "w";
		var opponents = [oppositeColor + "Q", oppositeColor + "R"];
		//check for potential vertical attack
		for(var y = 0; y < 8; y++){
			//check if king is in same column
			if(board[y][startX] === ownKing){
				var seekY;
				var seekAdjust;
				var seekCondition;
				if((startY - y) > 0){
				//check higher numbers(over startY) for things that can attack vertically
					seekY = startY + 1;
					seekAdjust = 1;
					seekCondition = function(seekY){
						return (seekY < 8);
					};
					
				}else{
				//check lower numbers(under startY) for things that can attack vertically
					seekY = startY - 1;
					seekAdjust = -1;
					seekCondition = function(seekY){
						return (seekY > 0);
					};
				}
				//now find the first piece in the line of sight
				for(; seekCondition(seekY); seekY += seekAdjust){
					//once the piece is not empty
					if(board[seekY][startX] !== 0){
						//king is in vertical check
						//!!! DON'T KNOW HOW TO SIGNIFY DIFF CHECK TYPES(WHICH SIDE)
						if(board[seekY][startX] in opponents){
							return true;
						}else{//king not in vertical check
							return false;
						}
					}
				}
			}
		}
		return false;
	}
	return false;
	
}

function pawn(color, startX, startY, destX, destY, board){
	if(color === "w"){
		//move forward 1
		if(destY - startY === 1){
			//moving diagonal 1, so killing a piece
			if((Math.abs(destX - startX) === 1)
			||(destX === startX && board[destY][destX] === 0)){
			//or, just moving forward(not diagonal) and empty space there
				return true;
			}
		}else if(Math.abs(destY - startY) === 2 && (startY === 6) && (board[destY][destX] === 0)){
		//first move for pawn, move two, also empty space
			return true;
		}
	/*same thing as white, only Y is reversed and we kill white pieces now
		also, can move two if start at y === 1
	*/
	}else if(color === "b"){
		if(destY - startY === -1){
			if((Math.abs(destX - startX) === 1)
			||(destX === startX && board[destY][destX] === 0)){
				return true;
			}
		}else if(Math.abs(destY - startY) === 2 && (startY === 1) && (board[destY][destX] === 0)){
			return true;
		}
	}
	return false;
}

function rook(startX, startY, destX, destY, board){
	//move vertically
	if(((destX === startX) && nothingBetweenLateral(startY, startX, startY, destY, board, true))
	||((destY === startY) && nothingBetweenLateral(startX, startX, startY, destX, board, false))){
	//move horizontally, destY is now destX, startY is now startX
		return true;
	}
	return false;
}

function knight(startX, startY, destX, destY){
	if((Math.abs(destX - startX) === 2 && Math.abs(destY - startY) === 1)
	||(Math.abs(destX - startX) === 1 && Math.abs(destY - startY) === 2)){
		return true;
	}
	return false;
}

function bishop(startX, startY, destX, destY, board){
	if((Math.abs(destX-startX) === Math.abs(destY-startY)) && nothingBetweenDiag(startX, startY, destX, destY, board)){
		return true;
	}
	return false;
}

function queen(startX, startY, destX, destY, board){
	if(Math.abs(destX - startX) === 0 && nothingBetweenLateral(startY, startX, startY, destY, board, true)){
	//move vertical
		return true;
	}else if(Math.abs(destY - startY) === 0 && nothingBetweenLateral(startX, startX, startY, destY, board, false)){
	//move horizontal
		return true;
	}else if((Math.abs(destY - startY) === Math.abs(destX - startX)) && nothingBetweenDiag(startX, startY, destX, destY, board)){
	//move diagonal
		return true;
	}
	return false;
}

// castling is done elsewhere
function king(startX, startY, destX, destY){
	//since eating its own piece is already checked for, nothing to really check
	if((Math.abs(startX - destX) === 1) && (Math.abs(startY - destY) === 1)){
		return true;
	}
	return false;
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

/* *** need to check if move is out of range of board - done
	check if it puts own king into check
	check if invalid move command(letter and numbers are out of order or something) - done
	check if move is not putting piece in the same place its already in - done
	check if move tries to kill piece of own colour -done
	check if it is indeed moving its own color piece - done
*/

//color is taken in as "w" or "b"
//move phrase is [PIECE][START][DEST]
module.exports.isValidMove = function (movePhrase, color, board){
	var isValid = false;
	var moveInfo = getMoveInfo(movePhrase); 

	var startX = moveInfo["startX"];
	var startY = moveInfo["startY"];
	var destX = moveInfo["destX"];
	var destY = moveInfo["destY"];
	var piece = moveInfo["piece"];
	var pieceColor = moveInfo["pieceColor"];
	
	//moving to same space
	if(((startX === destX) && (startY === destY))
	//moving piece of not own color
	|| (pieceColor !== color)
	//killing piece of own color
	|| (getColor(board, destX, destY) === color)
	//check if it puts king in check
	|| (isCheck(color, piece, startX, startY, destX, destY, board))){
		return false;
	}
	switch(piece){
		case "P":
			isValid = pawn(color, startX, startY, destX, destY, board);
			break;
		case "R":
			isValid = rook(startX, startY, destX, destY, board);
			break;
		case "N":
			isValid = knight(startX, startY, destX, destY);
			break;
		case "B":
			isValid = bishop(startX, startY, destX, destY, board);
			break;
		case "Q":
			isValid = queen(startX, startY, destX, destY, board);
			break;
		case "K":
			isValid = king(startX, startY, destX, destY);
			break;
	}

	return isValid;
}
