'use strict';

/**
takes in string value from move command from message,
converts it to value that can be used for accessing
the board array
**/
function getCoord(val){
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
function getColor(x, y, board){
	if(x > 7 || x < 0 || y > 7 || y < 0){
		throw new Error('trying to get color of something out of bounds');
	}else{
		return board[y][x].charAt(0);
	}
}

function getColor(piece){
	return piece.charAt(0);
}

function getPiece(x, y, board){
	if(x > 7 || x < 0 || y > 7 || y < 0){
		throw new Error('trying to get piece type of something out of bounds');
	}else{
		return board[y][x].charAt(1);
	}
}

function getPiece(piece){
	return piece.charAt(1);
}

function isInBoard(coord){
	return (coord > 0 && coord < 7);
}

function getMoveInfo(movePhrase, board){
	var startX = getCoord(movePhrase.charAt(0));
	var startY = getCoord(movePhrase.charAt(1));
	var destX = getCoord(movePhrase.charAt(2));
	var destY = getCoord(movePhrase.charAt(3));
	var piece = getPiece(startX, startY, board);
	var pieceColor = getColor(startX, startY, board);

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

function findNextPiece(adjustX, adjustY, startX, startY, board){
	if(isInBoard(startX) && isInBoard(startY) && Math.abs(adjustX) in [0,1] && Math.abs(adjustY) in [0,1]){
		return 0;
	}else if(board[startY][startX] !== 0){
		return board[startY][startX];
	}else{
		return findNextPiece(adjustX, adjustY, startX+adjustX, startY+adjustY, board);
	}
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

var self = module.exports = {
	/**
	returns 2d array that represents chess board
	N is knight
	b is black
	w is white
	**/
	/*accessing this board
	will be board[Y coord][X coord] because it is row then term*/
	initBoard: function(){
		var board = [["bR", "bN", "bB", "bQ", "bK", "bB", "bN", "bR"],
				 ["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],
				 [0, 0, 0, 0, 0, 0, 0, 0],
				 [0, 0, 0, 0, 0, 0, 0, 0],
				 [0, 0, 0, 0, 0, 0, 0, 0],
				 [0, 0, 0, 0, 0, 0, 0, 0],
				 ["wP", "wP", "wP", "wP", "wP", "wP", "wP", "wP"],
				 ["wR", "wN", "wB", "wQ", "wK", "wB", "wN", "wR"]];
		return board;
	},
	
	/**checks if moving side's king is put in check
	but knight case checks if its putitng opponent king into check

	this should really check if a king is put in check from old position(your king is in check)
	and from new position (enemy king is in check)
	**/
	isCheck: function(color, board){
		var findKing = function(color, board){
			var ownKing = color+"K";
			var ownKingCoords;
			for(var y = 0; y < 8; y++){
				for(var x = 0; x < 8; x++){
					if(board[y][x] === ownKing){
						ownKingCoords = [x, y];
					}
				}
			}
			if(ownKingCoords !== undefined){
				return ownKingCoords;
			}else{
				throw new Error("king of ${color} color was not found.");
			}
		}
	
		var horseCheck = function(color, ownKingX, ownKingY, board){
			var oppositeColor = color === "w" ? "b" : "w";
	
			//possible places that a knight could attack from
			let dirArray = [[-1, -2], [-1, 2], [1, -2], [1, 2],
							[-2, -1], [-2, 1], [2, -1], [2, 1]];
	
			for(var i = 0; i < dirArray.length; i++){
				for(var n = 0; n < 2; n++){
					/**if both coordinates are in the board and they are knights
					then the king is in check**/
					if(isInBoard(ownKingY+dirArray[i][n]) && isInBoard(ownKingX+dirArray[i][n])){
						if(board[ownKingY+dirArray[i][n]][ownKingX+dirArray[i][n]] === oppositeColor+"N"){
							return true;
						}
					}
				}
			}
			return false;
		}
	
		var kingCheck = function(color, ownKingX, ownKingY, board){
			var oppositeColor = color === "w" ? "b" : "w";
	
			//all around the king(possible places king could attack from)
			let dirArray = [[0, 1], [0, -1], [1, 0], [-1, 0],
							[1, -1], [-1, 1], [1, 1], [-1, -1]];
	
			for(var i = 0; i < 8; i++){
				for(var n = 0; n < 2; n++){
					if(isInBoard(ownKingY+dirArray[i][n]) && isInBoard(ownKingX+dirArray[i][n])){
						if(board[ownKingY+dirArray[i][n]][ownKingX+dirArray[i][n]] === oppositeColor+"K"){
							return true;
						}
					}
				}
			}
			return false;
		}
	
		var ownKingCoords = findKing(color, board);
		var oppositeColor = color === "w" ? "b" : "w";
		var vertSet = [oppositeColor+"Q", oppositeColor+"R"];
		var diagSet = [oppositeColor+"Q", oppositeColor+"B"];
	
		if(findNextPiece(0, 1, ownKingCoords[0], ownKingCoords[1] + 1, board) in vertSet){
		//up
			return true;
		}else if(findNextPiece(0, -1, ownKingCoords[0], ownKingCoords[1] - 1, board) in vertSet){
		//down
			return true;
		}else if(findNextPiece(1, 0, ownKingCoords[0] + 1, ownKingCoords[1], board) in vertSet){
		//right
			return true;
		}else if(findNextPiece(-1, 0, ownKingCoords[0] - 1, ownKingCoords[1], board) in vertSet){
		//left
			return true;
		}else if(findNextPiece(1, 1, ownKingCoords[0] + 1, ownKingCoords[1] + 1, board) in diagSet){
		//up right
			return true;
		}else if(findNextPiece(1, -1, ownKingCoords[0] + 1, ownKingCoords[1] - 1, board) in diagSet){
		//up left
			return true;
		}else if(findNextPiece(-1, 1, ownKingCoords[0] - 1, ownKingCoords[1] + 1, board) in diagSet){
		//down right
			return true;
		}else if(findNextPiece(-1, -1, ownKingCoords[0] - 1, ownKingCoords[1] - 1, board) in diagSet){
		//down left
			return true;
		}else if(color === "w" && ((board[ownKingCoords[1] + 1][ownKingCoords[0] + 1] === "P") || (board[ownKingCoords[1] + 1][ownKingCoords[0] - 1] === "P"))){
		//white and pawn above in either diagonal, 1 space apart
			return true;
		}else if(color === "b" && ((board[ownKingCoords[1] - 1][ownKingCoords[0] - 1] === "P") || (board[ownKingCoords[1] - 1][ownKingCoords[0] + 1] === "P"))){
		//black and pawn below in either diagonal, 1 space apart
			return true;
		}else if(horseCheck(color, ownKingCoords[0], ownKingCoords[1], board)){
		//check if horses can kill king from this position
			return true;
		}else if(kingCheck(color, ownKingCoords[0], ownKingCoords[1], board)){
		//check if opponent king can kill king from this position
			return true;
		}
	
		return false;
	
	},

	/* *** need to check if move is out of range of board - done
		check if it puts own king into check
		check if invalid move command(letter and numbers are out of order or something) - done
		check if move is not putting piece in the same place its already in - done
		check if move tries to kill piece of own colour -done
		check if it is indeed moving its own color piece - done
	*/

	//color is taken in as "w" or "b"
	//move phrase is [PIECE][START][DEST]
	isValidMove: function(movePhrase, color, checkStatus, board){
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
		|| (getColor(board, destX, destY) === color)){
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
	
		//if the move is valid but mover's king is in check before move
		if(isValid && checkStatus){
			var afterBoard = board.map(function(arr) {
			    return arr.slice();
			});
			afterBoard[startY][startX] = 0
			afterBoard[destY][destX] = piece;
			if(self.isCheck(color, afterBoard)){
				return false;
			}
		}
		return isValid;
	}
	
}
