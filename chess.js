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

/**checks if moving side's king is put in check
	but knight case checks if its putitng opponent king into check
	
	this should really check if a king is put in check from old position(your king is in check)
	and from new position (enemy king is in check)
**/
module.exports.isCheck = function(color, piece, x, y, board){
	var findAdjacents = function(color, piece, isDiag, adjustX, adjustY, x, y){
		var searchSet = isDiag ? ["Q","B"] : ["Q", "R"];
		
		/**
		the reason why these are incremented on their first call is to skip
		the center position from where they start
		if the piece has already been moved from there, then its irrelevant
		if the piece is still in there, then it should be checked against 
		any kings found elsewhere
		**/
		var abovePiece = findNextPiece(adjustX, adjustY, x+adjustX, y+adjustY, board);
		var belowPiece = findNextPiece(adjustX * -1, adjustY * -1, x-adjustX, y-adjustY, board);
		var abovePieceType = getPiece(abovePiece);
		var belowPieceType = getPiece(belowPiece);
		var aboveColor = getColor(abovePiece);
		var belowColor = getColor(belowPiece);
		/*if we are looking at move destination, check it against any enemy kings found*/
		if(getPiece(board[y][x]) === piece){
			/**check if piece in searchset only after knowing piece is obstructing
			above and below piece, so above and below piece dont cause false checks
			**/
			if(piece in searchSet){
				if((abovePieceType === "K" && aboveColor !== color)
				||(belowPieceType === "K" && belowColor !== color)){
					return true;
				}
			}else if(piece === "K"){
				//case where king is moving
				if((abovePieceType in searchSet && aboveColor !== color)
				||(belowPieceType in searchSet && belowColor !== color)){
					return true;
				}
			}
		}else if(aboveColor !== belowColor){
			//else, it should be a clear pathway between above and below piece
			if((abovePieceType in searchSet && belowPieceType === "K") 
			||(belowPieceType in searchSet && abovePieceType === "K")){
				return true;
			}
		//check if piece being moved puts enemy king in check
		}else if((piece in searchSet && (abovePieceType === "K") && (color !== aboveColor))
			  ||(piece in searchSet && (belowPieceType === "K") && (color !== belowColor))){
			return true;
		}
		
		return false;
	}
	
	//both these cases are for if the move has already been made
	if(piece === "K" && board[y][x] === piece){
		/** if an opponent knight is not found, still runs the find adjacent logic
			to find if king is endangered anywhere else(vertically, horizontally, diagonally)
		**/
		/**
		runs through all the possible locations of the knight
		with less code to look at
		there might be smarter way to do this...
		definitely runs 4 loops however
		**/
		var ones = [-1, 1];
		var twos = [-2, 2];
		
		for(var i = 0; i < 2; i++){
			for(var n = 0; i < 2; n++){
				/**if both coordinates are in the board and they are knights
				then the king is in check**/
				if(isInBoard(x+ones[i]) && isInBoard(y+twos[n])){
					if(getPiece(board[y+twos[n]][x+ones[i]]) === oppositeColor+"N"){
						return true;
					}
				}else if(isInBoard(x+twos[i]) && isInBoard(y+ones[n])){
				//reverse the adjustment to coord
					if(getPiece(board[y+ones[n]][x+twos[i]]) === oppositeColor+"N"){
						return true;
					}
				}
			}
		}
	}else if(piece === "N" && board[y][x] === piece){
	//if piece moving is a knight
		var oppositeColor = color === "w" ? "b" : "w";
		var ones = [-1, 1];
		var twos = [-2, 2];

		for(var i = 0; i < 2; i++){
			for(var n = 0; i < 2; n++){
				/**if both coordinates are in the board and they are knights
				then the king is in check**/
				if(isInBoard(x+ones[i]) && isInBoard(y+twos[n])){
					if(getPiece(board[y+twos[n]][x+ones[i]]) === oppositeColor+"K"){
						return true;
					}
				}else if(isInBoard(x+twos[i]) && isInBoard(y+ones[n])){
				//reverse the adjustment to coord
					if(getPiece(board[y+ones[n]][x+twos[i]]) === oppositeColor+"K"){
						return true;
					}
				}
			}
		}
	}
	
	//can look at move destination OR old coordinates(exposure of own king)
	if(findAdjacents(color, piece, false, 0, 1, x, y)){
	//looking vertically
		return true;
	}else if(findAdjacents(color, piece, false, 1, 0, x, y)){
	//look horizontally
		return true;
	}else if(findAdjacents(color, piece, false, 1, 1, x, y)){
	//look bottom left to top right diagonal
		return true;
	}else if(findAdjacents(color, piece, false, -1, 1, x, y)){
	//look bottom right to top left diagonal
		return true;
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

	return isValid;
}
